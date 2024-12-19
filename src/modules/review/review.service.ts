import { BaseService } from '@/common/base/base.service.abstract';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType, Prisma, User } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Injectable()
export class ReviewService extends BaseService<
  'Review',
  CreateReviewDto,
  UpdateReviewDto
> {
  constructor(
    protected prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {
    super(prisma, 'Review');
  }

  async create(
    dto: CreateReviewDto,
    user: User,
    args?: Omit<
      Prisma.TypeMap['model']['Review']['operations']['create']['args'],
      'data'
    >,
  ): Promise<
    Prisma.TypeMap['model']['Review']['operations']['create']['result'] | null
  > {
    const order = await this.prisma.order.findFirst({
      where: {
        user_id: user.id,
        details: {
          some: {
            product_detail: {
              product_id: dto.product_id,
            },
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Bạn cần mua sản phẩm này để đánh giá.');
    }

    const res = await this.prisma.review.create({
      data: {
        ...dto,
        user_id: user.id,
        order_id: order.id,
        status: 'APPROVED',
      },
      ...args,
      include: {
        product: true,
      },
    });

    const url =
      this.config.get('FRONTEND_CLIENT_URL') || 'http://localhost:5174';

    this.notificationService.sendNotificationToAdmin({
      content: `Sản phẩm ${res.product.code} có đánh giá mới`,
      type: NotificationType.ORDER_CHANGED,
      href: `${url}/product-detail/${dto.product_id}`,
      data: res,
    });

    return res || null;
  }
}
