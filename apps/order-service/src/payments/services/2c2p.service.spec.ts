import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Payment2C2PService } from './2c2p.service'
import { HttpModule, HttpService } from '@nestjs/axios'
import { Logger, UnprocessableEntityException } from '@nestjs/common'
import * as faker from 'faker'
const rxjs = require('rxjs') // ES5 import for mock inner function
jest.mock('rxjs')
const jwt = require('jsonwebtoken') // ES5 import for mock inner function
jest.mock('jsonwebtoken')

describe('Payment2C2PService', () => {
  let service: Payment2C2PService
  let httpService: HttpService
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Payment2C2PService,
        { provide: Logger, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method
              if (key === '2c2p.merchantID') return '123'
              else if (key === '2c2p.secretKey') return 'secretKey'
              else return 'test'
            }),
          },
        },
      ],
      imports: [HttpModule],
    }).compile()
    logger = module.get<Logger>(Logger)
    httpService = module.get<HttpService>(HttpService)
    service = module.get<Payment2C2PService>(Payment2C2PService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
  describe('service.getPaymentToken', () => {
    it('should return payment token 2c2p', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.resolve({
            data: {
              payload: jwt.sign(
                {
                  paymentToken: faker.finance.mask(20),
                  respCode: '0000',
                  respDesc: 'Success',
                },
                'secretKey',
              ),
            },
          }),
      }
      logger.log = jest.fn()
      jwt.sign = jest
        .fn()
        .mockReturnValue(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElEIjoiSlQwNCIsImludm9pY2VObyI6Ik1vb2treTAxIiwiZG',
        )
      jwt.verify = jest.fn().mockReturnValue({
        paymentToken:
          'kSAops9Zwhos8hSTSeLTUU3o184xaNR/T6ySCKGXyEBuOG+IdpUQMByX2CNQX7ogIAPBAgzDWpVj6447eDblRXUO/jOyK6mFETAAoLnxVjo=',
        respCode: '0000',
        respDesc: 'Success',
      })
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      const result = await service.getPaymentToken({
        merchantID: 'JT04',
        invoiceNo: 'Mookky01',
        description: 'item 1',
        amount: 20.0,
        currencyCode: 'THB',
        paymentChannel: ['IPP'],
        installmentPeriodFilter: [3, 10],
        interestType: 'M',
      })
      expect(result.respCode).toEqual('0000')
      expect(jwt.verify).toHaveBeenCalled()
    })

    it('should return error from 2C2P because of http error', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.reject({
            respCode: '9015',
            respDesc: 'Existing Invoice Number',
          }),
      }
      jwt.sign = jest.fn().mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCZG')
      jwt.verify = jest.fn()
      logger.log = jest.fn()
      logger.error = jest.fn()
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      try {
        await service.getPaymentToken({
          merchantID: 'JT04',
          invoiceNo: 'Mookky01',
          description: 'item 1',
          amount: 20.0,
          currencyCode: 'THB',
          paymentChannel: ['IPP'],
          installmentPeriodFilter: [3],
          interestType: 'M',
        })
      } catch (err) {
        expect(err).toEqual(
          new UnprocessableEntityException(
            'Cannot do payment please try again or contact to student support',
          ),
        )
        expect(jwt.verify).not.toHaveBeenCalled()
      }
    })

    it('should return error because resCode not equal syccessful but its Failed To Inquiry (2003)', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.resolve({
            respCode: '2003',
            respDesc: 'Failed To Inquiry.',
          }),
      }
      jwt.sign = jest.fn().mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCZG')
      jwt.verify = jest.fn()
      logger.log = jest.fn()
      logger.error = jest.fn()
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      try {
        await service.getPaymentToken({
          merchantID: 'JT04',
          invoiceNo: 'Mookky01',
          description: 'item 1',
          amount: 20.0,
          currencyCode: 'THB',
          paymentChannel: ['IPP'],
          installmentPeriodFilter: [3],
          interestType: 'M',
        })
      } catch (err) {
        expect(err).toEqual(
          new UnprocessableEntityException(
            'Cannot do payment please try again or contact to student support',
          ),
        )
        expect(jwt.verify).not.toHaveBeenCalled()
      }
    })
  })

  describe('service.doPayment2C2P', () => {
    const mockRequest = {
      payment: {
        code: {
          channelCode: 'IPP',
          agentCode: 'CITI',
        },
        data: {
          name: 'Dusadee',
          mobileNo: '0829144431',
          securePayToken:
            '00acY2o4CitbI4iQOHQSeDzLEqDIZhhVMA21zZ2o17oO+qgQLhdQwUpwyN1GQEQD0hIdFc+53oMOPi7uuxJSdrz/QzQhT+TtDhLwgyyUUPLcfNShDBh5JBe3zcaFAHjE+4EVzO5PEQ7vQPO4qdwGCwhKRF9lPcvLG/3ApJMrTkyd4yI=U2FsdGVkX18UAvnzC70WRE4myjiBsn3nJ0VJnWAZkbfpER/qoyoMAjm9nZOodr/a',
          interestType: 'M',
          installmentPeriod: 6,
          email: 'dusadee.s@globish.co.th',
        },
      },
      responseReturnUrl:
        'https://a2dd-2403-6200-88a4-bead-a0c0-4580-77a-e3ff.ngrok.io/Payments/Public/2c2p/GBA20211119IR29T-INS0/Webhook',
      clientIP: '49.49.217.192',
      paymentToken:
        'kSAops9Zwhos8hSTSeLTUS+YNVecq8e3l5AYhv2xM+t7t8hsvCe2/y+pqzUxFxlTxKZpMJ/eAUK5yker6OcleQ/EW5E0BQkbId7rVvxOa5Q=',
    }
    it('should return third party endpoint for payment to client', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.resolve({
            data: {
              data: 'https://demo2.2c2p.com/2C2PFrontEnd/storedCardPaymentV2/MPaymentProcess.aspx?token=4qbUjeoD6IdEcGI91wrhe4Zl6V4PzIwiGxuQckfZqpK6Eg4Vm2EUJ1AuqkWjKs+7',
              channelCode: 'IPP',
              respCode: '1001',
              respDesc: 'Redirect to authenticate ACS bank page.',
            },
          }),
      }
      logger.log = jest.fn()
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      const result = await service.doPayment2C2P(mockRequest)
      expect(result.respCode).toEqual('1001')
    })

    it('should return error because of http error and process terminate here', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.reject({
            data: {
              respCode: '9041',
              respDesc: 'Payment Token already used.',
            },
          }),
      }
      logger.error = jest.fn()
      logger.log = jest.fn()
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      mockRequest.paymentToken =
        'kSAops9Zwhos8----used-----hSTSeLTUS+YNVecq8e3l5AYhv2xM+t7t8hsvCe2/y+pqzUxFxlTxKZpMJ/eAUK5yker6OcleQ/EW5E0BQkbId7rVvxOa5Q='
      try {
        await service.doPayment2C2P(mockRequest)
      } catch (err) {
        expect(err).toEqual(
          new UnprocessableEntityException(
            'Cannot do payment please try again or contact to student support',
          ),
        )
      }
    })
    it('should return error because of payload not correct and process terminate here', async () => {
      const mockObservable = {
        toPromise: () =>
          Promise.resolve({
            data: {
              respCode: '2003',
              respDesc: 'Failed To Inquiry.',
            },
          }),
      }
      logger.error = jest.fn()
      logger.log = jest.fn()
      httpService.post = jest.fn().mockImplementation(() => mockObservable)
      delete mockRequest.payment.code
      try {
        const result = await service.doPayment2C2P(mockRequest)
        expect(result.respCode).toEqual('2003')
      } catch (err) {
        expect(err).toEqual(
          new UnprocessableEntityException(
            'Cannot do payment please try again or contact to student support',
          ),
        )
      }
    })
  })
})
