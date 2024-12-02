import type { Prisma } from '@prisma/client';
import { BaseQueryDto } from '../dtos/base.query.dto';
import {
  CreatePageInfoParams,
  DefaultSort,
  IPaginationResponse,
} from '../types';

export interface IBaseService<
  T extends keyof Prisma.TypeMap['model'],
  TCreateDto = any,
  TUpdateDto = any,
> {
  bCount(
    args: Prisma.TypeMap['model'][T]['operations']['count']['args'],
  ): Promise<number>;

  bCreate(
    data: TCreateDto,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['create']['result']>;

  bUpdate(
    id: string,
    data: TUpdateDto,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['update']['result']>;

  bFindOneByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['findUnique']['result'] | null
  >;

  bFindOneById(
    id: string,
    args?: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
  ): Promise<
    Prisma.TypeMap['model'][T]['operations']['findUnique']['result'] | null
  >;

  bFindAll(
    args?: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result'][]>;

  bFindFirstExists({
    args,
    mess_err,
  }: {
    args: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'];
    mess_err?: string;
  }): Promise<Prisma.TypeMap['model'][T]['operations']['findFirst']['result']>;

  bFindFirstByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'],
  ): Promise<T | null>;

  bFindAllByConditions(
    args: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result']>;

  bCreatePageInfo(params: CreatePageInfoParams<T>): IPaginationResponse<T>;

  bFindPagination(
    query: BaseQueryDto,
    excludeFields?: (keyof Prisma.TypeMap['model'][T]['fields'])[],
  ): Promise<IPaginationResponse<T>>;

  bDelete(
    args: Prisma.TypeMap['model'][T]['operations']['delete']['args'],
  ): void;

  bCreateMany(
    args: Prisma.TypeMap['model'][T]['operations']['createMany']['args'],
  ): void;

  bGetWhereCondition(
    query: object,
    searchTerm?: string,
    searchFields?: (keyof Prisma.TypeMap['model'][T]['fields'])[],
  ): object;

  bGetSortCondition(orderBy: object, sortFields?: DefaultSort): object[];

  bElmExists({
    args,
    mess_err,
  }: {
    args: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'];
    mess_err?: string;
    exclude?: (keyof Prisma.TypeMap['model'][T]['fields'])[];
  }): Promise<Prisma.TypeMap['model'][T]['operations']['findUnique']['result']>;
}
