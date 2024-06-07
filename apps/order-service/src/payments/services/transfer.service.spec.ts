import { ConflictException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import S3Service from '@root/libs/s3/src/lib/s3.service'
import { OrderInstance } from '@prisma/client'
import { TransferService } from '../services/transfer.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CreateTransferDto } from '../dtos/payment.dto'

describe('TransferService', () => {
  let service: TransferService
  let prismaService: PrismaService
  let s3Service: S3Service
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        PrismaService,
        ConfigService,
        Logger,
        { provide: S3Service, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile()

    service = module.get<TransferService>(TransferService)
    prismaService = module.get<PrismaService>(PrismaService)
    s3Service = module.get<S3Service>(S3Service)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  describe('service.transferPaymentOrder', () => {
    let file: File
    const slipPath: string = 'slipPath'
    const date: Date = new Date()
    const createTransfer: CreateTransferDto = {
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      fromBank: 'BBL',
      toBank: 'BBL',
      transferredAt: date,
      slip: [file],
    }
    let orderInstance: OrderInstance = {
      amount: 1000,
      code: 'instanceCode-1',
      createdAt: date,
      updatedAt: date,
      id: 1,
      orderId: 1,
      status: 'WaitingPurchase',
    }

    it('should be call with correct payload', async () => {
      prismaService.orderInstance.findUnique = jest
        .fn()
        .mockReturnValue(orderInstance)
      s3Service.uploadFile = jest.fn().mockReturnValue(slipPath)
      eventEmitter.emit = jest.fn()

      await service.transferPaymentOrder(createTransfer)
      expect(prismaService.orderInstance.findUnique).toHaveBeenCalledWith({
        where: {
          code: createTransfer.instanceCode,
        },
      })
      expect(s3Service.uploadFile).toHaveBeenCalledWith({
        file: [file],
        filePath: 'student/slip',
      })
    })

    it('should be throw ConflictException when order instance invalid status', async () => {
      orderInstance.status = 'Complete'
      prismaService.orderInstance.findUnique = jest
        .fn()
        .mockReturnValue(orderInstance)
      await expect(
        service.transferPaymentOrder(createTransfer),
      ).rejects.toThrow(ConflictException)
    })
  })
})
