import { Prisma } from '@prisma/client';
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateColorDto implements Prisma.ColorCreateInput {
  @IsHexColor()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
