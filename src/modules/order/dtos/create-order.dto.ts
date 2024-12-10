import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';
import { TransactionInfoDto } from './transaction-info.dto';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  id?: string;

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

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  cartItems: CreateOrderDetailDto[];
}
