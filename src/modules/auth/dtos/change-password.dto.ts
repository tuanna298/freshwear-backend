import { IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsStrongPassword()
  current_password: string;

  @IsStrongPassword()
  new_password: string;
}
