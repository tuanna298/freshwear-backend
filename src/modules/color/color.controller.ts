import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ColorService } from './color.service';
import { CreateColorDto } from './dtos/create-color.dto';
import { UpdateColorDto } from './dtos/update-color.dto';

@Controller('color')
export class ColorController extends BaseController<
  'Color',
  CreateColorDto,
  UpdateColorDto
>() {
  baseService: IBaseService<'Color', CreateColorDto, UpdateColorDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.ColorFieldRefs)[] = ['name', 'code'];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.ColorSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.ColorFieldRefs)[];

  constructor(private readonly colorService: ColorService) {
    super();
    this.baseService = this.colorService;
  }
}
