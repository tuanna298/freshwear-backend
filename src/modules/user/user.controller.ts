import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends BaseController<
  'User',
  CreateUserDto,
  UpdateUserDto
>() {
  baseService: IBaseService<'User', CreateUserDto, UpdateUserDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.UserFieldRefs)[] = [
    'full_name',
    'username',
    'email',
  ];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.UserSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.UserFieldRefs)[] = [
    'password',
    'password_reset_token_id',
  ];

  constructor(private readonly userService: UserService) {
    super();
    this.baseService = this.userService;
  }
}
