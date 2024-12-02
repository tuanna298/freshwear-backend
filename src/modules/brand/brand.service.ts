import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dtos/create-brand.dto';
import { UpdateBrandDto } from './dtos/update-brand.dto';

@Injectable()
export class BrandService extends BaseService<
  'Brand',
  CreateBrandDto,
  UpdateBrandDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Brand');
  }
}
