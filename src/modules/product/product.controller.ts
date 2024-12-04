import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController extends BaseController<
  'Product',
  CreateProductDto,
  UpdateProductDto
>() {
  baseService: IBaseService<'Product', CreateProductDto, UpdateProductDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.ProductFieldRefs)[] = [
    'name',
    'code',
    'description',
  ];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.ProductSelect<DefaultArgs> = {
    id: true,
    code: true,
    name: true,
    thumbnail: true,
    description: true,
    created_at: true,
    updated_at: true,
    details: {
      select: {
        id: true,
        quantity: true,
        price: true,
        image: true,
        brand: true,
        material: true,
        color: true,
        size: true,
        reviews: true,
        updated_at: true,
      },
    },
  };
  DEFAULT_EXCLUDE: (keyof Prisma.ProductFieldRefs)[];

  constructor(private readonly productService: ProductService) {
    super();
    this.baseService = this.productService;
  }
}
