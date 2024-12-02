import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSizeDto implements Prisma.SizeCreateInput {
  @IsString()
  @IsNotEmpty()
  name: string;
}
