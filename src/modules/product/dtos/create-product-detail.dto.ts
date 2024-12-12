import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDetailDto {
  @IsString({ message: 'ID phải là chuỗi.' })
  @IsOptional()
  id?: string;

  @IsNumber({}, { message: 'Giá phải là một số.' })
  price: number;

  @IsNumber({}, { message: 'Số lượng phải là một số.' })
  quantity: number;

  @IsString({ message: 'Hình ảnh phải là chuỗi.' })
  @IsOptional()
  image?: string;

  @IsString({ message: 'ID màu sắc phải là chuỗi.' })
  color_id: string;

  @IsString({ message: 'ID kích cỡ phải là chuỗi.' })
  size_id: string;
}
