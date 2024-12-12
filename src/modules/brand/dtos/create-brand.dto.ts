import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto implements Prisma.BrandCreateInput {
  @IsString({ message: 'Tên thương hiệu phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên thương hiệu không được để trống.' })
  name: string;
}
