import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialDto implements Prisma.MaterialCreateInput {
  @IsString({ message: 'Tên chất liệu phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên chất liệu không được để trống.' })
  name: string;
}
