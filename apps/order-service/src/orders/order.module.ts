import { Logger, Module } from '@nestjs/common'
import { OrderController } from './order.controller'
import { OrderService } from './services/order.service'
import { PrismaService } from '../prisma/prisma.service'
import { OrderRepository } from './repositories/order.repository'
import { OrderEvent } from './events/order.event'
import { RequireRoles } from '@root/common/guards/role.guard'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [OrderController],
  providers: [
    OrderService,
    PrismaService,
    OrderRepository,
    Logger,
    OrderEvent,
    RequireRoles,
  ],
})
export class OrderModule {}
