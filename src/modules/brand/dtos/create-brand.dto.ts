import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto implements Prisma.BrandCreateInput {
  @IsString()
  @IsNotEmpty()
  name: string;
}
