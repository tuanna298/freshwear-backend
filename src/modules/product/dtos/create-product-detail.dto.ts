import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDetailDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  color_id: string;

  @IsString()
  size_id: string;
}
