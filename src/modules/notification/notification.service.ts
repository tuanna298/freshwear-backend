import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService extends BaseService<'Notification', any, any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Notification');
  }
}
