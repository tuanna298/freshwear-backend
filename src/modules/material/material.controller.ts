import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateMaterialDto } from './dtos/create-material.dto';
import { UpdateMaterialDto } from './dtos/update-material.dto';
import { MaterialService } from './material.service';

@Controller('material')
export class MaterialController extends BaseController<
  'Material',
  CreateMaterialDto,
  UpdateMaterialDto
>() {
  baseService: IBaseService<'Material', CreateMaterialDto, UpdateMaterialDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.MaterialFieldRefs)[] = ['name'];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.MaterialSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.MaterialFieldRefs)[];

  constructor(private readonly materialService: MaterialService) {
    super();
    this.baseService = this.materialService;
  }
}
