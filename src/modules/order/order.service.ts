import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma, User } from '@prisma/client';
import { omit } from 'lodash';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';

@Injectable()
export class OrderService extends BaseService<
  'Order',
  CreateOrderDto,
  UpdateOrderDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Order');
  }

  async create(
    dto: CreateOrderDto,
    user: User,
    args?: Omit<
      Prisma.TypeMap['model']['Order']['operations']['create']['args'],
      'data'
    >,
  ): Promise<
    Prisma.TypeMap['model']['Order']['operations']['create']['result'] | null
  > {
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

    const transaction_info = dto.transaction_info;

    // handle vnPay
    // khi transaction_info !== null và dto.method === PaymentMethod.TRANSFER (tức là yêu cầu đầu tiên của khách hàng với pttt là online thì khởi tạo order với thông tin ban đầu và trả về vnPayUrl)
    if (transaction_info === null && dto.method === PaymentMethod.TRANSFER) {
      await this.prisma.orderHistory.create({
        data: {
          order_id: res.id,
          action_status: OrderStatus.PENDING,
          note: 'Chờ thanh toán',
        },
      });
      // String urlVnPay = vnPayService.createOrder(orderSave.getTotalMoney(), newOrder.getId());
      // gửi email thông báo cho admin
      // return urlVnPay;
    } else {
      // handle COD
      await this.prisma.orderHistory.create({
        data: {
          order_id: res.id,
          action_status: OrderStatus.WAIT_FOR_CONFIRMATION,
          note: 'Chờ xử lý',
        },
      });
    }
    // tạo payments
    // createPayment(newOrder, request);

    // gửi email thông báo cho admin
    return res || null;
  }
}
