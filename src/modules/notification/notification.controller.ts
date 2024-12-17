import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Controller, Get, Param } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController extends BaseController<
  'Notification',
  any,
  any
>() {
  baseService: IBaseService<'Notification', any, any>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.NotificationFieldRefs)[];
  DEFAULT_SELECT: Prisma.NotificationSelect<DefaultArgs>;
  DEFAULT_SORT_FIELD: DefaultSort;
  DEFAULT_EXCLUDE: (keyof Prisma.NotificationFieldRefs)[];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {
    super();
    this.baseService = this.notificationService;
  }

  @Get('read/:id')
  async readNotification(@Param('id') id: string) {
    return await this.prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });
  }

  @Get('read-all')
  async readAllNotifications() {
    return await this.prisma.notification.updateMany({
      data: { read: true },
    });
  }

  @Get('/unread')
  async getUnreadNotifications() {
    return await this.prisma.notification.findMany({
      where: { read: false },
    });
  }
}
