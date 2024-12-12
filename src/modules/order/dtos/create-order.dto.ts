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
  @IsString({ message: 'ID phải là chuỗi.' })
  @IsOptional()
  id?: string;

  @IsString({ message: 'Tên người nhận phải là chuỗi.' })
  receiver_name: string;

  @IsString({ message: 'Email phải là chuỗi.' })
  email: string;

  @IsString({ message: 'Địa chỉ phải là chuỗi.' })
  address: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi.' })
  phone_number: string;

  @IsString({ message: 'Ghi chú phải là chuỗi.' })
  @IsOptional()
  note?: string;

  @ValidateNested({ each: true, message: 'Thông tin giao dịch không hợp lệ.' })
  @Type(() => TransactionInfoDto)
  transaction_info: TransactionInfoDto;

  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ.' })
  method: PaymentMethod;

  @IsArray({ message: 'Giỏ hàng phải là một mảng.' })
  @ValidateNested({ each: true, message: 'Chi tiết đơn hàng không hợp lệ.' })
  @Type(() => CreateOrderDetailDto)
  cartItems: CreateOrderDetailDto[];
}
