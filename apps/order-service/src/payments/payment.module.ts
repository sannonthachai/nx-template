import { HttpModule } from '@nestjs/axios'
import { TransferService } from './services/transfer.service'
import { Module, Logger } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { QrcodeService } from './services/qrcode.service'
import { OrderService } from '../orders/services/order.service'
import { OrderRepository } from '../orders/repositories/order.repository'
import { Payment2C2PService } from './services/2c2p.service'
import { PaymentService } from './services/payment.service'
import { OmiseService } from './services/omise.service'
import { S3Module } from '@globish-micro-service/s3'
import {
  PrivatePaymentController,
  PublicPaymentController,
} from './payment.controller'
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 10,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Atlassian-Token': 'no-check',
      },
    }),
    S3Module,
  ],
  controllers: [PrivatePaymentController, PublicPaymentController],
  providers: [
    OmiseService,
    TransferService,
    OrderService,
    PrismaService,
    QrcodeService,
    PaymentService,
    Logger,
    OrderRepository,
    Payment2C2PService,
  ],
})
export class PaymentModule {}
