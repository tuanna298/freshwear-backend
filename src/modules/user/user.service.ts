import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService extends BaseService<
  'User',
  CreateUserDto,
  UpdateUserDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'User');
  }
}
