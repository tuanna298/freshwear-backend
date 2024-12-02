import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dtos/create-color.dto';
import { UpdateColorDto } from './dtos/update-color.dto';

@Injectable()
export class ColorService extends BaseService<
  'Color',
  CreateColorDto,
  UpdateColorDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Color');
  }
}
