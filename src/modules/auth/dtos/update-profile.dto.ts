import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class UpdateProfileDto extends PickType(CreateUserDto, [
  'full_name',
  'email',
  'dob',
  'phone_number',
  'avatar',
  'gender',
  'address',
]) {}
