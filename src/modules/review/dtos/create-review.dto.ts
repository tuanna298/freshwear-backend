import {
  IsBase64,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'Bình luận phải là chuỗi.' })
  comment: string;

  @IsString({ message: 'ID sản phẩm phải là chuỗi.' })
  product_id: string;

  @IsNumber({}, { message: 'Đánh giá phải là số.' })
  @Min(1, { message: 'Đánh giá nhỏ nhất là 1.' })
  @Max(5, { message: 'Đánh giá lớn nhất là 5.' })
  rating?: number;

  @IsBase64({}, { message: 'Ảnh phải là một chuỗi Base64 hợp lệ.' })
  @IsOptional()
  image?: string;
}
