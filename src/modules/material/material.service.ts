import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dtos/create-material.dto';
import { UpdateMaterialDto } from './dtos/update-material.dto';

@Injectable()
export class MaterialService extends BaseService<
  'Material',
  CreateMaterialDto,
  UpdateMaterialDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Material');
  }
}
