import { BaseService } from '@/common/base/base.service.abstract';
import { BaseQueryDto } from '@/common/base/dtos/base.query.dto';
import { OrderStatusLabel } from '@/common/constant';
import { EmailService } from '@/shared/mailer/email.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { VnpayService } from '@/shared/vnpay/vnpay.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationType,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { isEmpty, omit, size, uniqBy } from 'lodash';
import { NotificationService } from '../notification/notification.service';
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
    private readonly notificationService: NotificationService,
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {
    super(prisma, 'Order');
    this.logger = new Logger(OrderService.name);
  }

  async create(
    dto: CreateOrderDto,
    args?: Omit<
      Prisma.TypeMap['model']['Order']['operations']['create']['args'],
      'data'
    >,
  ) {
    const url =
      this.config.get('FRONTEND_ADMIN_URL') || 'http://localhost:5173';

    const total_money = dto.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const res = await this.prisma.order.create({
      data: {
        ...omit(dto, ['cartItems', 'transaction_info']),
        code: 'HD-' + Date.now(),
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

    // Giảm số lượng sản phẩm
    for (const item of dto.cartItems) {
      const productDetail = await this.prisma.productDetail.update({
        where: {
          id: item.product_detail_id,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
        include: {
          product: true,
          color: true,
          size: true,
        },
      });

      // Kiểm tra nếu số lượng sản phẩm sắp hết
      if (productDetail.quantity <= 5) {
        await this.notificationService.sendNotificationToAdmin({
          content: `${productDetail.product.code} - ${productDetail.color.name} / ${productDetail.size.name} sắp hết hàng`,
          type: NotificationType.PRODUCT_LOW_STOCK,
          href: `${url}/product/edit/${productDetail.product_id}`,
          data: productDetail,
        });
      }
    }

    // handle vnPay
    if (dto.method === PaymentMethod.TRANSFER) {
      await this.prisma.orderHistory.create({
        data: {
          order_id: res.id,
          order_code: res.code,
          action_status: OrderStatus.PENDING,
          note: 'Chờ thanh toán',
        },
      });
      const paymentUrl = await this.vnpayService.buildPaymentUrl(
        res.code,
        total_money,
      );

      return paymentUrl;
    } else {
      // handle COD
      await this.prisma.orderHistory.createMany({
        data: [
          {
            order_id: res.id,
            order_code: res.code,
            action_status: OrderStatus.PENDING,
            note: 'Chờ xử lý',
          },
          {
            order_id: res.id,
            order_code: res.code,
            action_status: OrderStatus.WAIT_FOR_CONFIRMATION,
            note: 'Xác nhận thanh toán khi nhận hàng',
          },
        ],
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
      // gửi noti thông báo cho admin

      await this.notificationService.sendNotificationToAdmin({
        content: `Đơn hàng mới #${res.code} cần xử lý`,
        type: NotificationType.ORDER_PLACED,
        href: `${url}/order/edit/${res.id}`,
        data: res,
      });
    }

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
        order_code: order.code,
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
    this.logger.log(`Order ${order.code} has been updated to ${status}`);
    // gửi mail thông báo cho user
    this.sendMailNotification(order.email, order);
    this.logger.log(`Mail has been sent to ${order.email}`);
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
    const url =
      this.config.get('FRONTEND_CLIENT_URL') || 'http://localhost:5174';

    await this.emailService.sendEmail({
      to: email,
      subject:
        OrderStatusLabel[order.status] +
        ' - Đơn hàng ' +
        order.code +
        ' đã được cập nhật trạng thái',
      template: 'mail-notification',
      context: {
        link: `${url}/tracking-order/${order.code}`,
      },
    });
  }

  async bFindOrderHistoryPagination(
    {
      page,
      perPage,
      orderBy,
      select,
      include,
      where,
      selected_ids = [],
    }: BaseQueryDto,
    exclude: (keyof Prisma.TypeMap['model']['OrderHistory']['fields'])[] = [],
  ) {
    let data_selected_ids = [];
    const take = perPage;
    const skip = perPage * (page - 1);
    if (!isEmpty(selected_ids)) {
      data_selected_ids = await this.prisma.orderHistory.findMany({
        where: { id: { in: selected_ids } },
        take,
        skip,
        select,
        include,
      } as any);
    }
    const [data, count] = await this.prisma.$transaction([
      this.prisma.orderHistory.findMany({
        where,
        take: take - size(data_selected_ids),
        skip,
        orderBy,
        select,
        include,
      } as any),
      this.prisma.orderHistory.count({ where }),
    ]);

    const processed_data = uniqBy([...data_selected_ids, ...data], 'id').map(
      (item) => omit(item, exclude),
    );

    return this.bCreatePageInfo({
      data: processed_data,
      total: count,
      take,
      skip,
    });
  }
}
