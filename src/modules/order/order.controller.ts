import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController extends BaseController<
  'Order',
  CreateOrderDto,
  UpdateOrderDto
>() {
  baseService: IBaseService<'Order', CreateOrderDto, UpdateOrderDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.OrderFieldRefs)[] = [
    'receiver_name',
    'code',
    'note',
    'phone_number',
    'email',
  ];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.OrderSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.OrderFieldRefs)[];

  constructor(private readonly orderService: OrderService) {
    super();
    this.baseService = this.orderService;
  }

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.orderService.create(dto, user);
  }
}
