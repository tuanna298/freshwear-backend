import { Prisma } from '@prisma/client';
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateColorDto implements Prisma.ColorCreateInput {
  @IsHexColor({ message: 'Mã màu phải là một mã màu hợp lệ (ví dụ: #FFFFFF).' })
  @IsNotEmpty({ message: 'Mã màu không được để trống.' })
  code: string;

  @IsString({ message: 'Tên màu phải là một chuỗi.' })
  @IsNotEmpty({ message: 'Tên màu không được để trống.' })
  name: string;
}
