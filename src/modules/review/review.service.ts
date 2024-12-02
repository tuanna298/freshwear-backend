import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Injectable()
export class ReviewService extends BaseService<
  'Review',
  CreateReviewDto,
  UpdateReviewDto
> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'Review');
  }
}
