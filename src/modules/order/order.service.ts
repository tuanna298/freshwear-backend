import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, User } from '@prisma/client';
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
        ...omit(dto, ['cartItems']),
        code: 'HD-' + Date.now(),
        user_id: user?.id,
        status: OrderStatus.PENDING,
        total_money,
        details: {
          create: dto.cartItems,
        },
      } as any,
      ...args,
    });
    // tạo order history, 2 case:
    // - nếu order được tạo với pttt là COD thì tạo order history với status là PENDING
    // - nếu order được tạo với pttt là online thì tạo order history với status là WAITING_FOR_CONFIRMAION

    // tạo payments
    // gửi email thông báo cho khách hàng
    // bắn notification cho admin
    return res || null;
  }
}
