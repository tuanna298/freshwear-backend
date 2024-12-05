import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async bCreate(
    dto: CreateProductDto,
    args?: Omit<
      Prisma.TypeMap['model']['Product']['operations']['create']['args'],
      'data'
    >,
  ): Promise<
    Prisma.TypeMap['model']['Product']['operations']['create']['result'] | null
  > {
    const res = await this.prisma[this.model_name].create({
      data: {
        ...dto,
        details: {
          create: dto.details,
        },
      },
      ...args,
    });
    return res || null;
  }

  async bUpdate(
    id: string,
    dto: UpdateProductDto,
    args?: Omit<
      Prisma.TypeMap['model']['Product']['operations']['create']['args'],
      'data' | 'where'
    >,
  ): Promise<
    Prisma.TypeMap['model']['Product']['operations']['update']['result'] | null
  > {
    // Lấy danh sách hiện tại của details từ cơ sở dữ liệu
    const existingDetails = await this.prisma.productDetail.findMany({
      where: { product_id: id },
    });

    // Lấy danh sách các ID trong DTO
    const updatedDetailsIds = dto.details?.map((detail) => detail.id) || [];

    // Xóa các details không còn trong DTO
    const detailsToDelete = existingDetails
      .filter((detail) => !updatedDetailsIds.includes(detail.id))
      .map((detail) => detail.id);

    await this.prisma.productDetail.deleteMany({
      where: {
        id: { in: detailsToDelete },
      },
    });

    const res = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        details: {
          upsert: dto.details?.map((detail) => ({
            where: { id: detail.id },
            update: detail,
            create: detail,
          })),
        },
      },
      ...args,
    });
    return res || null;
  }
}
