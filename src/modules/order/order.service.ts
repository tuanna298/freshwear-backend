import { BaseService } from '@/common/base/base.service.abstract';
import { OrderStatusLabel } from '@/common/constant';
import { EmailService } from '@/shared/mailer/email.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  User,
} from '@prisma/client';
import { omit } from 'lodash';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode } from 'vnpay';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';

@Injectable()
export class OrderService extends BaseService<
  'Order',
  CreateOrderDto,
  UpdateOrderDto
> {
  constructor(
    protected prisma: PrismaService,
    private readonly vnpayService: VnpayService,
    private readonly emailService: EmailService,
  ) {
    super(prisma, 'Order');
  }

  async create(
    dto: CreateOrderDto,
    user: User,
    args?: Omit<
      Prisma.TypeMap['model']['Order']['operations']['create']['args'],
      'data'
    >,
  ) {
    const total_money = dto.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const res = await this.prisma.order.create({
      data: {
        ...omit(dto, ['cartItems', 'transaction_info']),
        code: 'HD-' + Date.now(),
        user_id: user?.id,
        status:
          dto.method === PaymentMethod.TRANSFER
            ? OrderStatus.PENDING
            : OrderStatus.WAIT_FOR_CONFIRMATION,
        total_money,
        details: {
          create: dto.cartItems,
        },
      } as any,
      ...args,
    });

    // handle vnPay
    if (dto.method === PaymentMethod.TRANSFER) {
      await this.prisma.orderHistory.create({
        data: {
          order_id: res.id,
          action_status: OrderStatus.PENDING,
          note: 'Chờ thanh toán',
        },
      });
      await this.prisma.payment.create({
        data: {
          order_id: res.id,
          description: 'Thanh toán qua VNPAY',
          method: PaymentMethod.TRANSFER,
          status: PaymentStatus.PENDING,
          total: total_money,
        },
      });
      return this.vnpayService.buildPaymentUrl({
        vnp_Amount: total_money,
        vnp_OrderInfo: res.code,
        vnp_TxnRef: Math.floor(Math.random() * 1000000).toString(),
        vnp_IpAddr: '127.0.0.1',
        vnp_ReturnUrl: 'http://localhost:3000/vnpay/callback',
        vnp_OrderType: ProductCode.Other,
      });
    } else {
      // handle COD
      await this.prisma.orderHistory.create({
        data: {
          order_id: res.id,
          action_status: OrderStatus.WAIT_FOR_CONFIRMATION,
          note: 'Chờ xử lý',
        },
      });

      await this.prisma.payment.create({
        data: {
          order_id: res.id,
          description: 'Thanh toán khi nhận hàng',
          method: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
          total: total_money,
        },
      });
    }

    // gửi noti thông báo cho admin
    return res || null;
  }

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        details: {
          include: {
            product_detail: true,
          },
        },
      },
    });

    if (
      order.status === OrderStatus.CANCELED ||
      order.status === OrderStatus.EXPIRED ||
      order.status === OrderStatus.COMPLETED ||
      order.status === status
    ) {
      return;
    }

    await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    await this.prisma.orderHistory.create({
      data: {
        order_id: id,
        action_status: status,
        note,
      },
    });
    if (status === OrderStatus.CANCELED) {
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
    }
    if (status === OrderStatus.COMPLETED) {
      await this.prisma.payment.updateMany({
        where: {
          order_id: id,
          status: {
            not: PaymentStatus.PAID,
          },
        },
        data: {
          status: PaymentStatus.PAID,
        },
      });
    }
    // gửi mail thông báo cho user
    await this.sendMailNotification(order.email, order);
  }

  async trackingOrder(code: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: {
        code,
      },
      include: {
        details: {
          include: {
            product_detail: {
              include: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
        histories: true,
        payments: true,
      },
    });
  }

  private async sendMailNotification(email: string, order: Order) {
    await this.emailService.sendEmail({
      to: email,
      subject:
        OrderStatusLabel[order.status] +
        ' - Đơn hàng ' +
        order.code +
        ' đã được cập nhật trạng thái',
      template: 'mail-notification',
      context: {
        link: `http://localhost:5174/tracking-order/${order.code}`,
      },
    });
  }
}
