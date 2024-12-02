import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialDto implements Prisma.MaterialCreateInput {
  @IsString()
  @IsNotEmpty()
  name: string;
}
