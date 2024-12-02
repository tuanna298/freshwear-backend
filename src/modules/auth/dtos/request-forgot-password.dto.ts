import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class RequestForgotPasswordDto extends PickType(CreateUserDto, [
  'email',
]) {}
