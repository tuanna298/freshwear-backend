import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductService extends BaseService<
  'Product',
  CreateProductDto,
  UpdateProductDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Product');
  }
}
