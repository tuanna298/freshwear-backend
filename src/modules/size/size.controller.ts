import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateSizeDto } from './dtos/create-size.dto';
import { UpdateSizeDto } from './dtos/update-size.dto';
import { SizeService } from './size.service';

@Controller('size')
export class SizeController extends BaseController<
  'Size',
  CreateSizeDto,
  UpdateSizeDto
>() {
  baseService: IBaseService<'Size', CreateSizeDto, UpdateSizeDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.SizeFieldRefs)[] = ['name'];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.SizeSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.SizeFieldRefs)[];

  constructor(private readonly sizeService: SizeService) {
    super();
    this.baseService = this.sizeService;
  }
}
