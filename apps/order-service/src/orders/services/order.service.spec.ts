import { Test, TestingModule } from '@nestjs/testing'
import { OrderService } from './order.service'
import { Logger, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { mockOrder } from '../factories/order.factory'
import { mockOrderItem } from '../factories/order-item.factory'
import { OrderRepository } from '../repositories/order.repository'
import {
  OrderInstanceStatus,
  OrderStatus,
  TransferStatus,
} from '@prisma/client'
import {
  IVerifySlipComplete,
  IVerifySlipVoid,
} from '../interfaces/order.interface'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ICreateTransferSlipVerification } from '@order-service/src/common/interfaces/order.interface'

describe('OrderService', () => {
  let service: OrderService
  let prismaService: PrismaService
  let logger: Logger
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        Logger,
        PrismaService,
        OrderRepository,
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile()

    logger = module.get<Logger>(Logger)
    service = module.get<OrderService>(OrderService)
    prismaService = module.get<PrismaService>(PrismaService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  describe('service.createOrder', () => {
    const order = mockOrder({
      issuedDate: new Date('2021-12-12'),
    })
    it('Should return error if the process have something wrong', async () => {
      prismaService.order.create = jest.fn().mockImplementation((args) => {
        expect(args).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              issuedDate: new Date('2021-12-12'),
              dueDate: new Date('2021-12-19'),
            }),
            include: {
              orderInstances: true,
            },
          }),
        )
      })
      prismaService.orderItem.create = jest
        .fn()
        .mockRejectedValue(new Error(`Cannot read property 'id' of undefined`))
      logger.error = jest.fn()
      await expect(
        service.createOrder({
          ...order,
          orderItems: [mockOrderItem()],
          orderInstances: [],
        }),
      ).rejects.toThrowError(`Cannot read property 'id' of undefined`)
    })

    it('Should create new order', async () => {
      prismaService.order.create = jest.fn().mockImplementation((args) => {
        expect(args).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              issuedDate: new Date('2021-12-12'),
              dueDate: new Date('2021-12-19'),
            }),
            include: {
              orderInstances: true,
            },
          }),
        )
      })
      prismaService.orderItem.create = jest.fn()
      await service.createOrder({
        ...order,
        orderItems: [],
        orderInstances: [],
      })
      expect(prismaService.orderItem.create).not.toHaveBeenCalled()
    })
  })

  const orderCode: string = '123abc'
  const orderInstanceId: number = 1
  let transferSlips = {
    id: 1,
    status: 'WaitingApproval',
  }

  describe('OrderService.verifySlipComplete', () => {
    let payload: IVerifySlipComplete = {
      orderCode: '123abc',
      amount: 1000,
      instanceCode: 'instanceCode-1',
      toBank: 'SCB',
      transferSlipsId: 1,
      userId: '5678',
      userJson: {},
    }

    it('should be throw ConflictException when incorrect amount', async () => {
      prismaService.orderInstance.findUnique = jest.fn().mockReturnValue({
        id: orderInstanceId,
        amount: 2000,
        transferSlips: [transferSlips],
      })

      await expect(service.verifySlipComplete(payload)).rejects.toThrow(
        ConflictException,
      )
    })

    it('should be throw ConflictException when transferSlips status conflict', async () => {
      transferSlips.status = TransferStatus.Approved
      prismaService.orderInstance.findUnique = jest.fn().mockReturnValue({
        id: orderInstanceId,
        amount: 1000,
        transferSlips: [transferSlips],
      })

      await expect(service.verifySlipComplete(payload)).rejects.toThrow(
        ConflictException,
      )
    })

    it('should be call with correct payload', async () => {
      transferSlips.status = TransferStatus.WaitingApproval
      prismaService.orderInstance.findUnique = jest.fn().mockReturnValue({
        id: orderInstanceId,
        amount: 1000,
        transferSlips: [transferSlips],
      })
      service.transferSlipVerification = jest.fn()
      eventEmitter.emit = jest.fn()

      await service.verifySlipComplete(payload)
      expect(service.transferSlipVerification).toHaveBeenCalledWith({
        userId: payload.userId,
        userJson: payload.userJson,
        transferSlipId: transferSlips.id,
        status: TransferStatus.Approved,
      })
    })
  })

  describe('OrderService.verifySlipVoid', () => {
    let payload: IVerifySlipVoid = {
      orderCode: '123abc',
      instanceCode: 'instanceCode-1',
      transferSlipsId: 1,
      userId: '5678',
      userJson: {},
    }

    it('should be throw ConflictException when transferSlips status conflict', async () => {
      transferSlips.status = TransferStatus.Approved
      prismaService.orderInstance.findUnique = jest.fn().mockReturnValue({
        transferSlips: [transferSlips],
      })

      await expect(service.verifySlipVoid(payload)).rejects.toThrow(
        ConflictException,
      )
    })

    it('should be call with correct payload', async () => {
      transferSlips.status = TransferStatus.WaitingApproval
      prismaService.orderInstance.findUnique = jest.fn().mockReturnValue({
        id: orderInstanceId,
        amount: 1000,
        transferSlips: [transferSlips],
      })
      service.transferSlipVerification = jest.fn()
      eventEmitter.emit = jest.fn()

      await service.verifySlipVoid(payload)
      expect(service.transferSlipVerification).toHaveBeenCalledWith({
        userId: payload.userId,
        userJson: payload.userJson,
        transferSlipId: transferSlips.id,
        status: TransferStatus.Void,
      })
    })
  })

  describe('OrderService.updateOrderStatusVoid', () => {
    const order = mockOrder({
      issuedDate: new Date('2021-12-12'),
    })

    it('should be call with correct payload', async () => {
      prismaService.order.findUnique = jest.fn().mockReturnValue(order)
      prismaService.order.update = jest.fn()

      await service.updateOrderStatusVoid(orderCode)
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: {
          code: orderCode,
        },
      })
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: {
          code: orderCode,
        },
        data: {
          status: OrderStatus.Void,
          orderInstances: {
            updateMany: {
              where: {
                orderId: order.id,
              },
              data: {
                status: OrderInstanceStatus.Void,
              },
            },
          },
        },
      })
    })
  })

  describe('OrderService.updateOrderStatusRefund', () => {
    it('should be call with correct payload', async () => {
      prismaService.order.update = jest.fn()

      await service.updateOrderStatusRefund(orderCode)
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: {
          code: orderCode,
        },
        data: {
          status: OrderStatus.Refund,
        },
      })
    })
  })

  describe('OrderService.transferSlipVerification', () => {
    const payload: ICreateTransferSlipVerification = {
      status: 'Approved',
      transferSlipId: 1,
      userId: '5678',
      userJson: {},
    }
    it('should be call with correct payload', async () => {
      prismaService.$transaction = jest.fn()
      prismaService.transferSlipVerification.create = jest.fn()
      prismaService.transferSlip.update = jest.fn()

      await service.transferSlipVerification(payload)
      expect(
        prismaService.transferSlipVerification.create,
      ).toHaveBeenCalledWith({
        data: {
          userId: payload.userId,
          userJson: payload.userJson,
          transferSlipId: payload.transferSlipId,
        },
      })
      expect(prismaService.transferSlip.update).toHaveBeenCalledWith({
        where: {
          id: payload.transferSlipId,
        },
        data: {
          status: payload.status,
        },
      })
    })
  })
})
