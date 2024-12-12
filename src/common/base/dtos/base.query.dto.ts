import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BaseQueryDto {
  @IsOptional()
  @IsNumber({}, { message: 'Giá trị perPage phải là số.' })
  @Transform(({ value }) => +(value || 10))
  @Min(1, { message: 'Giá trị perPage nhỏ nhất là 1.' })
  @Max(100, { message: 'Giá trị perPage lớn nhất là 100.' })
  @Type(() => Number)
  perPage?: number = 10;

  @IsOptional()
  @IsNumber({}, { message: 'Giá trị page phải là số.' })
  @Transform(({ value }) => +(value || 1))
  @Min(1, { message: 'Giá trị page nhỏ nhất là 1.' })
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @IsObject({ message: 'Dữ liệu where phải là một đối tượng hợp lệ.' })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value || '{}');
    } catch {
      throw new Error('"where" phải là một chuỗi JSON hợp lệ.');
    }
  })
  readonly where: object;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error('"selected_ids" phải là một chuỗi JSON hợp lệ.');
    }
  })
  @IsArray({ message: 'Dữ liệu selected_ids phải là một mảng.' })
  @Type(() => String)
  selected_ids?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error('"orderBy" phải là một chuỗi JSON hợp lệ.');
    }
  })
  @ArrayNotEmpty({ message: 'Mảng không được rỗng.' })
  @IsArray({ message: 'Dữ liệu phải là một mảng.' })
  orderBy: object[];

  @IsOptional()
  @IsObject({ message: 'Dữ liệu phải là một đối tượng hợp lệ.' })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value || '{}');
    } catch {
      throw new Error('"select" phải là một chuỗi JSON hợp lệ.');
    }
  })
  readonly select: object;

  @IsOptional()
  @IsObject({ message: 'Dữ liệu phải là một đối tượng hợp lệ.' })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value || '{}');
    } catch {
      throw new Error('"include" phải là một chuỗi JSON hợp lệ.');
    }
  })
  include?: object;

  @IsOptional()
  @IsString({ message: 'Giá trị phải là chuỗi.' })
  search?: string;
}
