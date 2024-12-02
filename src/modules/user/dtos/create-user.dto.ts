import { Gender, Prisma } from '@prisma/client';
import {
  IsBase64,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsString()
  full_name: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsDateString()
  @IsOptional()
  dob?: string | Date;

  @IsStrongPassword()
  password: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsBase64()
  @IsOptional()
  avatar?: string;

  @IsPhoneNumber('VI')
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
