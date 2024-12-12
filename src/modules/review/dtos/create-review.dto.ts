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
  @IsString({ message: 'Bình luận phải là chuỗi.' })
  comment: string;

  @IsNumber({}, { message: 'Đánh giá phải là số.' })
  @Min(1, { message: 'Đánh giá nhỏ nhất là 1.' })
  @Max(5, { message: 'Đánh giá lớn nhất là 5.' })
  rating?: number;

  @IsBase64({}, { message: 'Ảnh phải là một chuỗi Base64 hợp lệ.' })
  image: string;

  @IsObject({ message: 'Dữ liệu sản phẩm phải là một đối tượng hợp lệ.' })
  product: Prisma.ProductCreateNestedOneWithoutReviewsInput;

  @IsObject({ message: 'Dữ liệu đơn hàng phải là một đối tượng hợp lệ.' })
  order: Prisma.OrderCreateNestedOneWithoutReviewInput;
}
