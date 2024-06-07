import { HttpService } from '@nestjs/axios'
import { ConflictException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { OrderInstance } from '@prisma/client'
import {
  ChargeCreditCardDto,
  InstallmentsChargeCreditCardDto,
} from '../dtos/payment.dto'
import { IOmiseSource, IOmiseWebhookData } from '../interfaces/omise.interface'
import { OmiseService } from '../services/omise.service'

describe('omiseService', () => {
  let service: OmiseService
  let prismaService: PrismaService
  let eventEmitter: EventEmitter2

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmiseService,
        Logger,
        PrismaService,
        ConfigService,
        { provide: HttpService, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile()

    service = module.get<OmiseService>(OmiseService)
    prismaService = module.get<PrismaService>(PrismaService)
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  const date = new Date()
  let orderInstance: OrderInstance = {
    amount: 1000,
    code: 'instanceCode-1',
    createdAt: date,
    updatedAt: date,
    id: 1,
    orderId: 1,
    status: 'WaitingPurchase',
  }
  const omiseSource: IOmiseSource = {
    installmentTerm: 4,
  }
  const omiseWebhookDataFullCharge: IOmiseWebhookData = {
    amount: 1000,
    metadata: {
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      studentInstanceId: '1',
      studentOrderId: '1',
      type: 'BBL'
    },
    net: 1000,
    status: 'successful',
    card: {},
  }
  const omiseWebhookDataInstallmentCharge: IOmiseWebhookData = {
    amount: 1000,
    metadata: {
      orderCode: 'orderCode-1',
      instanceCode: 'instanceCode-1',
      type: 'SCB',
      studentInstanceId: '1',
      studentOrderId: '1'
    },
    net: 1000,
    status: 'successful',
    source: omiseSource,
  }
  const installmentsCharge: InstallmentsChargeCreditCardDto = {
    orderCode: 'orderCode-1',
    bank: 'SCB',
    installmentTerm: 4,
    instanceCode: 'instanceCode-1',
    token: 'token',
  }
  const charge: ChargeCreditCardDto = {
    orderCode: 'orderCode-1',
    instanceCode: 'instanceCode-1',
    token: 'token',
  }

  describe('service.webhookOmise', () => {
    it('should be call webhookOmiseFullCharge', async () => {
      service.webhookOmiseFullCharge = jest.fn()
      service.webhookOmiseInstallmentsCharge = jest.fn()
      await service.webhookOmise({}, omiseWebhookDataFullCharge)
      expect(service.webhookOmiseFullCharge).toHaveBeenCalled()
      expect(service.webhookOmiseInstallmentsCharge).not.toHaveBeenCalled()
    })

    it('should be call omiseWebhookInstallmentsCharge', async () => {
      service.webhookOmiseFullCharge = jest.fn()
      service.webhookOmiseInstallmentsCharge = jest.fn()
      await service.webhookOmise({}, omiseWebhookDataInstallmentCharge)
      expect(service.webhookOmiseFullCharge).not.toHaveBeenCalled()
      expect(service.webhookOmiseInstallmentsCharge).toHaveBeenCalled()
    })
  })

  describe('service.installmentsChargeCreditCard', () => {
    it('should be throw ConflictException when installmentsCharge already completed', async () => {
      orderInstance.status = 'Complete'
      prismaService.orderInstance.findUnique = jest
        .fn()
        .mockReturnValueOnce(orderInstance)
      await expect(
        service.installmentsChargeCreditCard(installmentsCharge),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('service.chargeCreditCard', () => {
    it('should be throw ConflictException when installmentsCharge already completed', async () => {
      orderInstance.status = 'Complete'
      prismaService.orderInstance.findUnique = jest
        .fn()
        .mockReturnValueOnce(orderInstance)
      await expect(
        service.chargeCreditCard(installmentsCharge),
      ).rejects.toThrow(ConflictException)
    })
  })
})
