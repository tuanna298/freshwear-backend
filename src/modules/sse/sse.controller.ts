import { Public } from '@/decorators/public.decorator';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Sse('/notifications')
  async sseNotifications(): Promise<Observable<MessageEvent>> {
    return new Observable((subscriber) => {
      const interval = setInterval(async () => {
        const notifications = await this.prisma.notification.findMany({
          orderBy: [
            {
              read: 'asc',
            },
            {
              created_at: 'asc',
            },
          ],
        });
        subscriber.next({ data: notifications });
      }, 1000);

      return () => clearInterval(interval);
    });
  }
}
