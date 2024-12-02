import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class SignUpDto extends PickType(CreateUserDto, [
  'email',
  'username',
  'password',
]) {}
