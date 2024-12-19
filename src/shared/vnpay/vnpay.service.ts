import { NotificationService } from '@/modules/notification/notification.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { Response } from 'express';
import { VnpayService as NestjsVnpayService } from 'nestjs-vnpay';
import { ProductCode, ReturnQueryFromVNPay } from 'vnpay';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VnpayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nestjsVnpayService: NestjsVnpayService,
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {
    this.logger = new Logger(VnpayService.name);
  }

  async buildPaymentUrl(orderCode: string, total: number) {
    const url = this.config.get('BACKEND_URL') || 'http://localhost:3000';
    return this.nestjsVnpayService.buildPaymentUrl({
      vnp_Amount: total,
      vnp_OrderInfo: orderCode,
      vnp_TxnRef: new Date().getTime().toString(),
      vnp_IpAddr: '127.0.0.1',
      vnp_ReturnUrl: `${url}/vnpay/callback`,
      vnp_OrderType: ProductCode.Other,
      vnp_BankCode: undefined,
    });
  }

  async handleVnpayCallback(query: ReturnQueryFromVNPay, res: Response) {
    const adminUrl =
      this.config.get('FRONTEND_ADMIN_URL') || 'http://localhost:5173';
    const clientUrl =
      this.config.get('FRONTEND_CLIENT_URL') || 'http://localhost:5174';

    try {
      const verify = await this.nestjsVnpayService.verifyReturnUrl(query);
      if (!verify.isVerified) {
        throw new Error('Data integrity verification failed');
      }
      if (!verify.isSuccess) {
        throw new Error('Payment order failed');
      }

      const order = await this.prisma.order.findFirstOrThrow({
        where: {
          code: verify.vnp_OrderInfo,
        },
      });

      await this.prisma.payment.upsert({
        where: {
          transaction_code: String(verify.vnp_TransactionNo),
        },
        create: {
          order_id: order.id,
          method: PaymentMethod.TRANSFER,
          description: 'Đã hanh toán qua VNPAY',
          status: PaymentStatus.PAID,
          transaction_code: String(verify.vnp_TransactionNo),
          total: order.total_money,
        },
        update: {
          status: PaymentStatus.PAID,
        },
      });

      await this.prisma.orderHistory.create({
        data: {
          order_id: order.id,
          order_code: order.code,
          action_status: OrderStatus.WAIT_FOR_DELIVERY,
          note: 'Đã hanh toán qua VNPAY',
        },
      });

      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.WAIT_FOR_DELIVERY,
        },
      });

      await this.notificationService.sendNotificationToAdmin({
        content: `Đơn hàng mới #${order.code} cần xử lý`,
        type: NotificationType.ORDER_PLACED,
        href: `${adminUrl}/order/edit/${order.id}`,
        data: order,
      });

      return res.redirect(`${clientUrl}/order-success?shouldClearCart=true`);
    } catch (error) {
      this.logger.error('Error when handle vnpay callback: ', error);
      this.handlePaymentFailure(query.vnp_OrderInfo, error.message);
      return res.redirect(`${clientUrl}/order-failed`);
    }
  }

  private async handlePaymentFailure(orderCode: string, note?: string) {
    try {
      const order = await this.prisma.order.findFirstOrThrow({
        where: {
          code: orderCode,
        },
        include: {
          details: {
            include: {
              product_detail: true,
            },
          },
        },
      });

      for (const orderDetail of order.details) {
        await this.prisma.productDetail.update({
          where: {
            id: orderDetail.product_detail_id,
          },
          data: {
            quantity: {
              increment: orderDetail.quantity,
            },
          },
        });
      }

      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.PAYMENT_FAILED,
        },
      });

      await this.prisma.orderHistory.create({
        data: {
          order_id: order.id,
          order_code: order.code,
          action_status: OrderStatus.PAYMENT_FAILED,
          note: 'Thanh toán thất bại: ' + note,
        },
      });

      this.logger.log(
        `Order ${orderCode} payment failed and product quantities updated.`,
      );
    } catch (error) {
      this.logger.error('Error when handling payment failure: ', error);
    }
  }
}
