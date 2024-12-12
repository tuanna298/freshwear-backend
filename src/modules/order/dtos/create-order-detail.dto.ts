import { IsNumber, IsString } from 'class-validator';

export class CreateOrderDetailDto {
  @IsString({ message: 'Mã chi tiết sản phẩm phải là chuỗi.' })
  product_detail_id: string;

  @IsNumber({}, { message: 'Số lượng phải là một số.' })
  quantity: number;

  @IsNumber({}, { message: 'Giá phải là một số.' })
  price: number;

  @IsNumber({}, { message: 'Tổng số tiền phải là một số.' })
  total: number;
}
