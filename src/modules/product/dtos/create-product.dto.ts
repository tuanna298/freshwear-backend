import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProductDetailDto } from './create-product-detail.dto';

export class CreateProductDto {
  @IsString({ message: 'Mã sản phẩm phải là chuỗi.' })
  code: string;

  @IsString({ message: 'Tên sản phẩm phải là chuỗi.' })
  name: string;

  @IsString({ message: 'Mô tả phải là chuỗi.' })
  @IsOptional()
  description: string;

  @IsString({ message: 'Hình ảnh thu nhỏ phải là chuỗi.' })
  @IsOptional()
  thumbnail?: string;

  @IsString({ message: 'ID thương hiệu phải là chuỗi.' })
  brand_id: string;

  @IsString({ message: 'ID chất liệu phải là chuỗi.' })
  material_id: string;

  @IsArray({ message: 'Chi tiết sản phẩm phải là một mảng.' })
  @ValidateNested({
    each: true,
    message: 'Dữ liệu chi tiết sản phẩm không hợp lệ.',
  })
  @Type(() => CreateProductDetailDto)
  details?: CreateProductDetailDto[];
}
