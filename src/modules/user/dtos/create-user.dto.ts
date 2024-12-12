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
  @IsString({
    message: 'Họ và tên không hợp lệ',
  })
  full_name: string;

  @IsString({
    message: 'Tên đăng nhập không hợp lệ',
  })
  username: string;

  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ',
    },
  )
  email: string;

  @IsStrongPassword(
    {
      minLength: 1,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Mật khẩu không hợp lệ, phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    },
  )
  password: string;

  @IsEnum(Gender, {
    message:
      'Giới tính không hợp lệ, chỉ chấp nhận giá trị: ' +
      Object.values(Gender).join(', '),
  })
  @IsOptional()
  gender?: Gender;

  @IsBase64(
    {},
    {
      message: 'Avatar không hợp lệ, chỉ chấp nhận base64 string',
    },
  )
  @IsOptional()
  avatar?: string;

  @IsPhoneNumber('VI', {
    message: 'Số điện thoại không hợp lệ',
  })
  @IsOptional()
  phone_number?: string;

  @IsString({
    message: 'Địa chỉ không hợp lệ',
  })
  @IsOptional()
  address?: string;

  @IsDateString(
    {},
    {
      message: 'Ngày không hợp lệ',
    },
  )
  @IsOptional()
  last_login?: string | Date;
}
