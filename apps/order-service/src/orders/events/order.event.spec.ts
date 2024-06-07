import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import {
  IUpdateOrderAndOrderInstance,
  IUpdateOrderStatusComplete,
  IUpdateOrderStatusVoid,
  IUpdateOrderStatusWaitingApproval,
} from '@order-service/src/common/interfaces/order.interface'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import {
  OrderInstanceStatus,
  OrderStatus,
  TransferStatus,
} from '@prisma/client'
import { OrderEvent } from './order.event'

describe('OrderService', () => {
  let event: OrderEvent
  let prismaService: PrismaService
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderEvent, Logger, PrismaService],
    }).compile()

    logger = module.get<Logger>(Logger)
    event = module.get<OrderEvent>(OrderEvent)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe('event.createTransactionEvent', () => {
    const payload: IUpdateOrderStatusComplete = {
      amount: 1000,
      gateway: 'OMISE',
      installmentTerm: 4,
      medthod: 'INSTALLMENT',
      net: 1000,
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      type: 'income',
      bank: 'SCB',
      orderInstanceId: 1,
      webHookJson: {},
    }

    it('should be call with correct payload', async () => {
      prismaService.$transaction = jest.fn()
      prismaService.orderInstance.update = jest.fn()
      prismaService.transaction.create = jest.fn()
      event.checkOrderInstanceAndUpdateOrder = jest.fn()

      await event.createTransactionEvent(payload)
      expect(prismaService.orderInstance.update).toHaveBeenCalledWith({
        data: {
          status: OrderInstanceStatus.Complete,
        },
        where: {
          code: payload.instanceCode,
        },
      })
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
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
      })
      expect(event.checkOrderInstanceAndUpdateOrder).toHaveBeenCalledWith({
        orderCode: payload.orderCode,
        instanceCode: payload.instanceCode,
        orderStatus: OrderStatus.Complete,
        orderInstanceStatus: OrderInstanceStatus.Complete,
      })
    })
  })

  describe('event.updateOrderStatusWaitingApprovalEvent', () => {
    const payload: IUpdateOrderStatusWaitingApproval = {
      amount: 1000,
      fromBank: 'SCB',
      toBank: 'SCB',
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      orderInstanceId: 1.1,
      slipPath: 'slipPath',
      transferredAt: new Date(),
    }

    it('should be call with correct payload', async () => {
      prismaService.$transaction = jest.fn()
      prismaService.orderInstance.update = jest.fn()
      prismaService.transferSlip.create = jest.fn()
      event.checkOrderInstanceAndUpdateOrder = jest.fn()

      await event.updateOrderStatusWaitingApprovalEvent(payload)
      expect(prismaService.orderInstance.update).toHaveBeenCalledWith({
        where: {
          code: payload.instanceCode,
        },
        data: {
          status: OrderInstanceStatus.WaitingApproval,
        },
      })
      expect(prismaService.transferSlip.create).toHaveBeenCalledWith({
        data: {
          amount: payload.amount,
          fromBank: payload.fromBank,
          toBank: payload.toBank,
          slipPath: payload.slipPath,
          transferredAt: payload.transferredAt,
          status: TransferStatus.WaitingApproval,
          orderInstanceId: payload.orderInstanceId,
        },
      })
      expect(event.checkOrderInstanceAndUpdateOrder).toHaveBeenCalledWith({
        orderCode: payload.orderCode,
        instanceCode: payload.instanceCode,
        orderStatus: OrderStatus.WaitingApproval,
        orderInstanceStatus: OrderInstanceStatus.WaitingApproval,
      })
    })
  })

  describe('event.updateOrderStatusVoidEvent', () => {
    const payload: IUpdateOrderStatusVoid = {
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
    }
    it('should be call with correct payload', async () => {
      prismaService.orderInstance.update = jest.fn()
      event.checkOrderInstanceAndUpdateOrder = jest.fn()

      await event.updateOrderStatusVoidEvent(payload)
      expect(prismaService.orderInstance.update).toHaveBeenCalledWith({
        data: {
          status: OrderInstanceStatus.Void,
        },
        where: {
          code: payload.instanceCode,
        },
      })
      expect(event.checkOrderInstanceAndUpdateOrder).toHaveBeenCalledWith({
        orderCode: payload.orderCode,
        instanceCode: payload.instanceCode,
        orderStatus: OrderStatus.Void,
        orderInstanceStatus: OrderInstanceStatus.Void,
      })
    })
  })

  describe('event.checkOrderInstanceAndUpdateOrder', () => {
    const payload: IUpdateOrderAndOrderInstance = {
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      orderInstanceStatus: 'Void',
      orderStatus: 'Void',
    }
    let orderInstances = {
      orderInstances: [{ status: 'WaitingApproval' }],
    }

    it('should be update only orderInstance', async () => {
      prismaService.order.findUnique = jest.fn().mockReturnValue(orderInstances)
      prismaService.order.update = jest.fn()

      await event.checkOrderInstanceAndUpdateOrder(payload)
      expect(prismaService.order.update).not.toBeCalled()
    })

    it('should be update order and orderInstance', async () => {
      orderInstances.orderInstances[0].status = OrderInstanceStatus.Void
      prismaService.order.findUnique = jest.fn().mockReturnValue(orderInstances)
      prismaService.order.update = jest.fn()

      await event.checkOrderInstanceAndUpdateOrder(payload)
      expect(prismaService.order.update).toBeCalled()
    })
  })
})
