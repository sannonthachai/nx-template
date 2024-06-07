import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  IUpdateOrderStatusVoid,
  IUpdateOrderStatusComplete,
  IUpdateOrderStatusWaitingApproval,
  IUpdateOrderAndOrderInstance,
} from '@order-service/src/common/interfaces/order.interface'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import {
  OrderInstanceStatus,
  OrderStatus,
  TransferStatus,
} from '@prisma/client'

@Injectable()
export class OrderEvent {
  constructor(private prisma: PrismaService, private logger: Logger) {}

  @OnEvent('order.createTransaction')
  async createTransactionEvent(
    payload: IUpdateOrderStatusComplete,
  ): Promise<void> {
    try {
      if (!payload.orderInstanceId) {
        const orderInstance = await this.prisma.orderInstance.findUnique({
          where: {
            code: payload.instanceCode,
          },
        })

        payload.orderInstanceId = orderInstance.id
      }
      await this.prisma.$transaction([
        this.prisma.orderInstance.update({
          data: {
            status: OrderInstanceStatus.Complete,
          },
          where: {
            code: payload.instanceCode,
          },
        }),
        this.prisma.transaction.create({
          data: {
            amount: payload.amount,
            medthod: payload.medthod,
            gateway: payload.gateway,
            net: payload.net,
            bank: payload.bank,
            type: payload.type,
            installmentTerm: payload.installmentTerm,
            orderInstanceId: payload.orderInstanceId,
            webhookJson: payload.webHookJson,
          },
        }),
      ])
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `CreateTransactionEvent error : ${err.message}`,
      )
    }

    await this.checkOrderInstanceAndUpdateOrder({
      orderCode: payload.orderCode,
      instanceCode: payload.instanceCode,
      orderStatus: OrderStatus.Complete,
      orderInstanceStatus: OrderInstanceStatus.Complete,
    })
  }

  @OnEvent('order.updateOrderStatusWaitingApproval')
  async updateOrderStatusWaitingApprovalEvent(
    payload: IUpdateOrderStatusWaitingApproval,
  ): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.orderInstance.update({
          where: {
            code: payload.instanceCode,
          },
          data: {
            status: OrderInstanceStatus.WaitingApproval,
          },
        }),
        this.prisma.transferSlip.create({
          data: {
            amount: payload.amount,
            fromBank: payload.fromBank,
            toBank: payload.toBank,
            slipPath: payload.slipPath,
            transferredAt: payload.transferredAt,
            status: TransferStatus.WaitingApproval,
            orderInstanceId: payload.orderInstanceId,
          },
        }),
      ])
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `UpdateOrderStatusWaitingApprovalEvent error : ${err.message}`,
      )
    }

    await this.checkOrderInstanceAndUpdateOrder({
      orderCode: payload.orderCode,
      instanceCode: payload.instanceCode,
      orderStatus: OrderStatus.WaitingApproval,
      orderInstanceStatus: OrderInstanceStatus.WaitingApproval,
    })
  }

  @OnEvent('order.UpdateOrderStatusVoid')
  async updateOrderStatusVoidEvent(
    payload: IUpdateOrderStatusVoid,
  ): Promise<void> {
    try {
      await this.prisma.orderInstance.update({
        data: {
          status: OrderInstanceStatus.Void,
        },
        where: {
          code: payload.instanceCode,
        },
      })
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `UpdateOrderStatusVoidEvent error : ${err.message}`,
      )
    }

    await this.checkOrderInstanceAndUpdateOrder({
      orderCode: payload.orderCode,
      instanceCode: payload.instanceCode,
      orderStatus: OrderStatus.Void,
      orderInstanceStatus: OrderInstanceStatus.Void,
    })
  }

  async checkOrderInstanceAndUpdateOrder(
    payload: IUpdateOrderAndOrderInstance,
  ): Promise<void> {
    try {
      const { orderInstances } = await this.prisma.order.findUnique({
        where: {
          code: payload.orderCode,
        },
        select: {
          orderInstances: {
            select: {
              status: true,
            },
          },
        },
      })

      if (
        orderInstances.every(
          (value) => value.status === payload.orderInstanceStatus,
        )
      ) {
        await this.prisma.order.update({
          data: {
            status: payload.orderStatus,
          },
          where: {
            code: payload.orderCode,
          },
        })
      }
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `CheckOrderInstanceAndUpdateOrder error : ${err.message}`,
      )
    }
  }
}
