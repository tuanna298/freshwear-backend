import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';

@Controller('brand')
export class BrandController extends BaseController<
  'Brand',
  CreateBrandDto,
  UpdateBrandDto
>() {
  baseService: IBaseService<'Brand', CreateBrandDto, UpdateBrandDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.BrandFieldRefs)[] = ['name'];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.BrandSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.BrandFieldRefs)[];

  constructor(private readonly brandService: BrandService) {
    super();
    this.baseService = this.brandService;
  }
}
