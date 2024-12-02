import { BaseController } from '@/common/base/base.controller.abstract';
import { IBaseService } from '@/common/base/interfaces/base.service.interface';
import { DefaultSort } from '@/common/base/types';
import { Controller } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController extends BaseController<
  'Review',
  CreateReviewDto,
  UpdateReviewDto
>() {
  baseService: IBaseService<'Review', CreateReviewDto, UpdateReviewDto>;
  DEFAULT_SEARCH_FIELD: (keyof Prisma.ReviewFieldRefs)[] = ['comment'];
  DEFAULT_SORT_FIELD: DefaultSort = {
    updated_at: 'desc',
  };
  DEFAULT_SELECT: Prisma.ReviewSelect<DefaultArgs>;
  DEFAULT_EXCLUDE: (keyof Prisma.ReviewFieldRefs)[];

  constructor(private readonly reviewService: ReviewService) {
    super();
    this.baseService = this.reviewService;
  }
}