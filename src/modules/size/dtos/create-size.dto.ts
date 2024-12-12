import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSizeDto implements Prisma.SizeCreateInput {
  @IsString({ message: 'Tên kích thước phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên kích thước không được để trống.' })
  name: string;
}
