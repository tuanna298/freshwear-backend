import { IsObject, IsOptional, IsString } from 'class-validator';
import { CreateProductDetailDto } from './create-product-detail.dto';

export class CreateProductDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  brand_id: string;

  @IsString()
  material_id: string;

  @IsObject()
  @IsOptional()
  details?: CreateProductDetailDto[];
}
