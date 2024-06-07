import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { HttpExceptionFilter } from '@root/common/filters/http-exception.filter'
import { LoggingInterceptor } from '@root/common/interceptors/logging.interceptor'
import { TransformInterceptor } from '@root/common/interceptors/transform.interceptor'
import CommonConfig from '@order-service/config/common.config'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PaymentModule } from './payments/payment.module'
import { OrderModule } from './orders/order.module'
import GBPayConfig from '@order-service/config/gb-pay.config'
import Payment2c2pConfig from '@order-service/config/2c2p.config'
import OmiseConfig from '@order-service/config/omise.config'
import { S3Module } from '@globish-micro-service/s3'
import { EventEmitterModule } from '@nestjs/event-emitter'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/order-service/.env',
      load: [CommonConfig, GBPayConfig, Payment2c2pConfig, OmiseConfig],
    }),
    S3Module,
    OrderModule,
    PaymentModule,
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
