import { PrismaService } from '@/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export class AuthCleanUpJob {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(AuthCleanUpJob.name);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanUpRevokedToken() {
    this.logger.debug(
      '======================= Start cronjob CLEANUP REVOKED TOKEN =======================',
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.revokedToken.deleteMany({
        where: {
          expires_at: {
            lt: new Date(),
          },
        },
      });
    });

    this.logger.debug(
      '======================= Finish cronjob CLEANUP REVOKED TOKEN =======================',
    );
  }
}
