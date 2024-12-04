import { Prisma } from '@prisma/client';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateProductDto implements Prisma.ProductCreateInput {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsObject()
  @IsOptional()
  details?: Prisma.ProductDetailCreateNestedManyWithoutProductInput;
}
