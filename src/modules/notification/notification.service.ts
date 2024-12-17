import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class NotificationService extends BaseService<'Notification', any, any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Notification');
  }

  async sendNotificationToAdmin(
    data: Pick<
      Prisma.NotificationCreateInput,
      'content' | 'href' | 'type' | 'read' | 'delivered' | 'data'
    >,
  ) {
    const adminUser = await this.prisma.user.findFirstOrThrow({
      where: {
        role: Role.ADMIN,
      },
    });

    await this.prisma.notification.create({
      data: {
        user_id: adminUser.id,
        content: data.content,
        href: data.href,
        type: data.type,
        read: data.read,
        delivered: data.delivered,
        data: data.data,
      },
    });
  }
}
