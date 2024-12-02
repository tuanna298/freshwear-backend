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
  @IsNumber()
  @Transform(({ value }) => +(value || 10))
  @Min(1)
  @Max(100)
  @Type(() => Number)
  perPage?: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +(value || 1))
  @Min(1)
  @Type(() => Number)
  readonly page?: number = 1;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value || '{}'))
  readonly where: object;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  @Type(() => String)
  selected_ids?: string[];

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @ArrayNotEmpty()
  @IsArray()
  orderBy: object[];

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value || '{}'))
  readonly select: object;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value || '{}'))
  include?: object;

  @IsOptional()
  @IsString()
  search?: string;
}
