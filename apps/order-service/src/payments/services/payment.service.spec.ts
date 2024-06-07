import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { OrderService } from '@order-service/src/orders/services/order.service'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { PaymentService } from './payment.service'
import { mockOrder } from '../../orders/factories/order.factory'
import { mockOrderItem } from '@order-service/src/orders/factories/order-item.factory'
import { Prisma } from '@prisma/client'
import { QrcodeService } from './qrcode.service'
import { Payment2C2PService } from './2c2p.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

describe('PaymentService', () => {
  let service: PaymentService
  let prismaService: PrismaService
  let qrcodeService: QrcodeService
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        QrcodeService,
        PrismaService,
        ConfigService,
        PaymentService,
        Payment2C2PService,
        { provide: OrderService, useValue: {} },
        { provide: QrcodeService, useValue: {} },
        { provide: Payment2C2PService, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
        { provide: HttpService, useValue: {} },
      ],
    }).compile()

    service = module.get<PaymentService>(PaymentService)
    prismaService = module.get<PrismaService>(PrismaService)
    qrcodeService = module.get<QrcodeService>(QrcodeService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('service.getPaymentDescription', () => {
    it('should return payment description', async () => {
      const order = mockOrder()
      prismaService.order.findUnique = jest.fn().mockReturnValueOnce({
        ...order,
        orderInstances: [{ amount: 22000 }],
        orderItems: [mockOrderItem({ name: 'General English G1 1/2' })],
      })
      const result = await service.getPaymentDescription({
        orderCode: 'XXXXX',
        instanceCode: 'DSSDS',
      })
      const ownerInfo = order?.ownerJson as Prisma.JsonObject
      expect(result).toEqual({
        orderCode: 'XXXXX',
        instanceCode: 'DSSDS',
        items: 'General English G1 1/2',
        amount: 22000,
        remark: order.remark,
        ownerId: order.ownerId,
        ownerName: ownerInfo?.fullnameEn,
        ownerEmail: ownerInfo?.email,
        ownerPhone: ownerInfo?.phone,
      })
    })

    it('should return error because order not found', async () => {
      prismaService.order.findUnique = jest.fn().mockReturnValueOnce(undefined)
      await expect(
        service.getPaymentDescription({
          orderCode: 'XXXXX',
          instanceCode: 'DSSDS',
        }),
      ).rejects.toThrowError('This order payment not found!')
    })
  })
})
