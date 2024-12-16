import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { VnpayService as NestjsVnpayService } from 'nestjs-vnpay';
import { ProductCode, ReturnQueryFromVNPay } from 'vnpay';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VnpayService {
  constructor(
    private readonly prisma: PrismaService,
    private nestjsVnpayService: NestjsVnpayService,
    private logger: Logger,
  ) {
    this.logger = new Logger(VnpayService.name);
  }

  async buildPaymentUrl(orderCode: string, total: number) {
    return this.nestjsVnpayService.buildPaymentUrl({
      vnp_Amount: total,
      vnp_OrderInfo: orderCode,
      vnp_TxnRef: Math.floor(Math.random() * 1000000).toString(),
      vnp_IpAddr: '127.0.0.1',
      vnp_ReturnUrl: 'http://localhost:3000/vnpay/callback',
      vnp_OrderType: ProductCode.Other,
    });
  }

  async handleVnpayCallback(query: ReturnQueryFromVNPay) {
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
          description: 'Thanh toán qua VNPAY',
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
          note: 'Thanh toán qua VNPAY',
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
    } catch (error) {
      this.logger.error('Error when handle vnpay callback: ', error);
      this.handlePaymentFailure(query.vnp_OrderInfo, error.message);
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
