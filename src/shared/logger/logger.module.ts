import { Global, Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
  exports: [Logger],
})
@Global()
export class LoggerModule {}
