import { IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsStrongPassword()
  new_password: string;

  @IsString()
  token: string;
}
