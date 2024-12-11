import { BaseService } from '@/common/base/base.service.abstract';
import { BaseQueryDto } from '@/common/base/dtos/base.query.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { isEmpty, omit, size, uniqBy } from 'lodash';
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

  async bFindPagination(
    { page, perPage, orderBy, select, where, selected_ids = [] }: BaseQueryDto,
    exclude: (keyof Prisma.TypeMap['model']['User']['fields'])[],
  ) {
    let data_selected_ids = [];
    const take = perPage;
    const skip = perPage * (page - 1);
    if (!isEmpty(selected_ids)) {
      data_selected_ids = await this.prisma.user.findMany({
        where: { id: { in: selected_ids }, role: Role.USER },
        take,
        skip,
        select,
      });
    }
    const [data, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { ...where, role: Role.USER },
        take: take - size(data_selected_ids),
        skip,
        orderBy,
        select,
      }),
      this.prisma.user.count({ where }),
    ]);

    const processed_data = uniqBy([...data_selected_ids, ...data], 'id').map(
      (item) => omit(item, exclude),
    );
    return this.bCreatePageInfo({
      data: processed_data,
      total: count,
      take,
      skip,
    });
  }
}
