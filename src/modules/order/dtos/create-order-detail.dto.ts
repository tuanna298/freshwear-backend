import { IsNumber, IsString } from 'class-validator';

export class CreateOrderDetailDto {
  @IsString()
  product_detail_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  total: number;
}
