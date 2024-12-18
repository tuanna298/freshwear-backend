import { BaseController } from '@/common/base/base.controller.abstract';
import { BaseQueryDto } from '@/common/base/dtos/base.query.dto';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Public } from '@/decorators/public.decorator';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {
    super();
    this.baseService = this.orderService;
  }

  @Public()
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return await this.orderService.create(dto);
  }

  @Put(':id/update-status')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status, note }: Pick<UpdateOrderDto, 'status' | 'note'>,
  ): Promise<void> {
    await this.orderService.updateStatus(id, status, note);
  }

  @Get('/tracking-code/:code')
  async trackingOrder(@Param('code') code: string) {
    return this.orderService.trackingOrder(code);
  }

  @Public()
  @Get('/history')
  async findAllOrderHistory(@Query() query: BaseQueryDto) {
    const whereCondition = this.baseService.bGetWhereCondition(
      query.where,
      query.search,
      [],
    );
    const sortCondition = this.baseService.bGetSortCondition(
      query.orderBy,
      this.DEFAULT_SORT_FIELD || {},
    );

    return await this.orderService.bFindOrderHistoryPagination(
      {
        ...query,
        where: whereCondition,
        orderBy: sortCondition,
        select: query?.select,
      },
      [],
    );
  }
}
