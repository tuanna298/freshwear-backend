import { Prisma } from '@prisma/client';
import {
  IsBase64,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto implements Prisma.ReviewCreateWithoutUserInput {
  @IsString()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsBase64()
  image: string;

  @IsObject()
  product: Prisma.ProductCreateNestedOneWithoutReviewsInput;

  @IsObject()
  order: Prisma.OrderCreateNestedOneWithoutReviewInput;
}
