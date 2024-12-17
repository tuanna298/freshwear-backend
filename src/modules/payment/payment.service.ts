import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService extends BaseService<'Payment', any, any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Payment');
  }
}
