import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController extends BaseController<'Payment', any, any>() {
  baseService: IBaseService<'Payment', any, any>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.PaymentFieldRefs)[] = [
    'transaction_code',
    'description',
  ];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.PaymentSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.PaymentFieldRefs)[];

  constructor(private readonly paymentService: PaymentService) {
    super();
    this.baseService = this.paymentService;
  }
}
