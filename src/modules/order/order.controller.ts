import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { Public } from '@/decorators/public.decorator';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
  DEFAULT_SELECT: Prisma.OrderSelect<DefaultArgs> = {
    id: true,
    code: true,
    user_id: true,
    address: true,
    phone_number: true,
    receiver_name: true,
    email: true,
    total_money: true,
    note: true,
    method: true,
    status: true,
    created_at: true,
    updated_at: true,
    user: true,
    details: {
      select: {
        id: true,
        product_detail_id: true,
        order_id: true,
        quantity: true,
        price: true,
        product_detail: {
          select: {
            id: true,
            quantity: true,
            image: true,
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                thumbnail: true,
                brand: true,
                material: true,
              },
            },
            color: {
              select: {
                id: true,
                name: true,
              },
            },
            size: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },
    histories: true,
    payments: true,
  };
  DEFAULT_EXCLUDE: (keyof Prisma.OrderFieldRefs)[];

  constructor(private readonly orderService: OrderService) {
    super();
    this.baseService = this.orderService;
  }

  @Public()
  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.orderService.create(dto, user);
  }

  @Put(':id/update-status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: Pick<UpdateOrderDto, 'status'>,
  ): Promise<void> {
    await this.orderService.bUpdate(id, { status });
  }

  @Get('/tracking-code/:code')
  async trackingOrder(@Param('code') code: string) {
    return this.orderService.trackingOrder(code);
  }
}
