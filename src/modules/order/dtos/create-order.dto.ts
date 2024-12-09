import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';
import { TransactionInfoDto } from './transaction-info.dto';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  code: string;

  @IsString()
  receiver_name: string;

  @IsString()
  email: string;

  @IsString()
  address: string;

  @IsString()
  phone_number: string;

  @IsString()
  @IsOptional()
  note?: string;

  @ValidateNested({ each: true })
  @Type(() => TransactionInfoDto)
  transaction_info: TransactionInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  cartItems: CreateOrderDetailDto[];
}
