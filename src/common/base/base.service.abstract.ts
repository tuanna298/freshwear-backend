import { PrismaService } from '@/shared/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isEmpty, omit, size, uniqBy } from 'lodash';
import { BaseQueryDto } from './dtos/base.query.dto';
import { IBaseService } from './interfaces/base.service.interface';
import { DefaultSort, IPaginationResponse } from './types';

export abstract class BaseService<
  T extends keyof Prisma.TypeMap['model'],
  TCreateDto,
  TUpdateDto,
> implements IBaseService<T, TCreateDto, TUpdateDto>
{
  constructor(
    protected prisma: PrismaService,
    protected model_name: Prisma.ModelName,
  ) {
    this.prisma = prisma;
    this.model_name = model_name;
  }

  async bCount(
    args: Prisma.TypeMap['model'][T]['operations']['count']['args'],
  ): Promise<number> {
    const res = await this.prisma[this.model_name].count({ ...args });
    return res || 0;
  }

  async bCreate(
    dto: TCreateDto,
    args?: Omit<
      Prisma.TypeMap['model'][T]['operations']['create']['args'],
      'data'
    >,
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['create']['result'] | null
  > {
    const res = await this.prisma[this.model_name].create({
      data: dto,
      ...args,
    });
    return res || null;
  }

  async bUpdate(
    id: string,
    dto: TUpdateDto,
    args?: Omit<
      Prisma.TypeMap['model'][T]['operations']['create']['args'],
      'data' | 'where'
    >,
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['update']['result'] | null
  > {
    const res = await this.prisma[this.model_name].update({
      where: { id },
      data: dto,
      ...args,
    });
    return res || null;
  }

  async bFindOneByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['findUnique']['result'] | null
  > {
    const res = await this.prisma[this.model_name].findUnique({
      ...args,
    });
    return res || null;
  }

  async bFindOneById(
    id: string,
    args?: Omit<
      Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
      'where'
    >,
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['findUnique']['result'] | null
  > {
    const res = await this.prisma[this.model_name].findUnique({
      where: { id },
      ...args,
    });
    return res || null;
  }

  async bFindAll(
    args?: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result'][]> {
    const res = await this.prisma[this.model_name].findMany({
      ...args,
    });
    return res || [];
  }

  async bFindAllByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result']> {
    const res = await this.prisma[this.model_name].findMany({
      ...args,
    });
    return res || [];
  }

  bCreatePageInfo({ data, total, take, skip }): IPaginationResponse<T> {
    const page = take ? Math.floor(skip / take) + 1 : 1;
    const total_page = take && total ? Math.ceil(total / take) : 1;
    const next_page = total_page > page ? page + 1 : page;
    const prev_page = page !== 1 ? page - 1 : page;
    return {
      data,
      pageInfo: {
        take: take === -1 ? total : take,
        page: take === -1 ? 1 : page,
        total,
        total_page,
        next_page,
        prev_page,
        has_next_page: page < total_page,
        has_prev_page: page > 1,
      },
    };
  }

  async bFindPagination(
    {
      page,
      perPage,
      orderBy,
      select,
      include,
      where,
      selected_ids = [],
    }: BaseQueryDto,
    exclude: (keyof Prisma.TypeMap['model'][T]['fields'])[] = [],
  ) {
    let data_selected_ids = [];
    const take = perPage;
    const skip = perPage * (page - 1);
    if (!isEmpty(selected_ids)) {
      data_selected_ids = await this.prisma[this.model_name].findMany({
        where: { id: { in: selected_ids } },
        take,
        skip,
        select,
        include,
      });
    }
    const [data, count] = await this.prisma.$transaction([
      this.prisma[this.model_name].findMany({
        where,
        take: take - size(data_selected_ids),
        skip,
        orderBy,
        select,
        include,
      }),
      this.prisma[this.model_name].count({ where }),
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

  async bDelete(
    args: Prisma.TypeMap['model'][T]['operations']['delete']['args'],
  ) {
    return this.prisma[this.model_name].delete({ ...args });
  }

  async bCreateMany(
    args: Prisma.TypeMap['model'][T]['operations']['createMany']['args'],
  ) {
    return await this.prisma[this.model_name].createMany({ ...args });
  }

  bGetWhereCondition(
    query: object,
    searchTerm?: string,
    searchFields?: (keyof Prisma.TypeMap['model'][T]['fields'])[],
  ) {
    const querySearch = query?.['search'] || '';
    delete query?.['search'];

    const searchConditions = searchFields.map((field) => ({
      [field as string]: {
        contains: searchTerm || querySearch || '',
        mode: 'insensitive',
      },
    }));
    return { AND: [{ ...query }, { OR: searchConditions }] };
  }

  async bFindFirstExists({
    args,
    mess_err = `Không tìm thấy dữ liệu!`,
  }: {
    args: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'];
    mess_err?: string;
  }): Promise<Prisma.TypeMap['model'][T]['operations']['findFirst']['result']> {
    const res = await this.prisma[this.model_name].findFirst({
      ...args,
    });
    if (!res?.id) {
      throw new BadRequestException(`${mess_err}`);
    }
    return res;
  }

  async bFindFirstByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'],
  ) {
    const res = await this.prisma[this.model_name].findFirst({
      ...args,
    });
    return res;
  }

  bGetSortCondition(orderBy: Array<object>, sortFields?: DefaultSort) {
    const sortCondition = Object.keys(sortFields).map((item) => ({
      [item]: sortFields[item],
    }));
    return [...(orderBy || []), ...sortCondition];
  }

  async bElmExists({
    args,
    mess_err = `Không tìm thấy dữ liệu!`,
    exclude,
  }: {
    args: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'];
    mess_err?: string;
    exclude?: (keyof Prisma.TypeMap['model'][T]['fields'])[];
  }): Promise<
    Prisma.TypeMap['model'][T]['operations']['findUnique']['result']
  > {
    const res: any = await this.bFindOneByConditions(args);
    if (!res?.id) {
      throw new BadRequestException(`${mess_err}`);
    }
    return omit(res, exclude);
  }
}
