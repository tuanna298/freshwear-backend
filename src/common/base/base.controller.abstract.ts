import { Body, Get, Injectable, Param, Post, Put, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseQueryDto } from './dtos/base.query.dto';
import { IBaseService } from './interfaces/base.service.interface';
import { DefaultSort } from './types';

export function BaseController<
  T extends keyof Prisma.TypeMap['model'],
  CreateDto,
  UpdateDto,
>() {
  @Injectable()
  abstract class BaseControllerClass {
    abstract baseService: IBaseService<T>;
    abstract DEFAULT_SEARCH_FIELD: (keyof Prisma.TypeMap['model'][T]['fields'])[];
    abstract DEFAULT_SORT_FIELD: DefaultSort;
    abstract DEFAULT_SELECT: Prisma.TypeMap['model'][T]['operations']['findMany']['args']['select'];
    abstract DEFAULT_EXCLUDE: (keyof Prisma.TypeMap['model'][T]['fields'])[];

    @Get()
    async findAll(@Query() query: BaseQueryDto) {
      const whereCondition = this.baseService.bGetWhereCondition(
        query.where,
        query.search,
        this.DEFAULT_SEARCH_FIELD || [],
      );
      const sortCondition = this.baseService.bGetSortCondition(
        query.orderBy,
        this.DEFAULT_SORT_FIELD || {},
      );

      return await this.baseService.bFindPagination(
        {
          ...query,
          where: whereCondition,
          orderBy: sortCondition,
          select: query?.select || this.DEFAULT_SELECT,
        },
        this.DEFAULT_EXCLUDE || [],
      );
    }

    @Get('/:id')
    async findById(
      @Param('id') id: string,
      @Query() query: BaseQueryDto,
    ): Promise<
      Prisma.TypeMap['model'][T]['operations']['findUnique']['result']
    > {
      return await this.baseService.bElmExists({
        args: {
          where: {
            id,
          },
          select: query?.select || this.DEFAULT_SELECT,
        },
        exclude: this.DEFAULT_EXCLUDE || [],
      });
    }

    @Post()
    async createBase(@Body() dto: CreateDto): Promise<void> {
      await this.baseService.bCreate(dto);
    }

    @Put(':id')
    async update(
      @Body() dto: UpdateDto,
      @Param('id') id: string,
    ): Promise<void> {
      await this.baseService.bUpdate(id, dto);
    }

    async delete(@Param('id') id: string) {
      this.baseService.bDelete({
        where: { id },
      });
    }
  }

  return BaseControllerClass;
}
