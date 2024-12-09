import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDetailDto)
  details?: CreateProductDetailDto[];
}
