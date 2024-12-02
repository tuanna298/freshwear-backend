import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateSizeDto } from './dtos/create-size.dto';
import { UpdateSizeDto } from './dtos/update-size.dto';

@Injectable()
export class SizeService extends BaseService<
  'Size',
  CreateSizeDto,
  UpdateSizeDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Size');
  }
}
