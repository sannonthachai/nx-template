import {
  BadGatewayException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { catchError, map, switchMap, take, tap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { AxiosRequestConfig } from 'axios'
import {
  ChargeCreditCardDto,
  InstallmentsChargeCreditCardDto,
} from '../dtos/payment.dto'
import { IOmiseWebhookData } from '../interfaces/omise.interface'
import {
  OrderInstanceStatus,
  TransactionGateway,
  TransactionMethod,
  TransactionType,
} from '@prisma/client'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IUpdateOrderStatusComplete } from '@order-service/src/common/interfaces/order.interface'
import { IRedirectPayment } from '@order-service/src/common/interfaces/payment.interface'
import { TransformTransactionBank } from '@order-service/src/orders/enums/transaction.enum'

@Injectable()
export class OmiseService {
  private configAxiosSecret: AxiosRequestConfig
  private chargeUrl: string
  private studentUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: Logger,
    private config: ConfigService,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    this.configAxiosSecret = {
      auth: {
        username: this.config.get<string>('omise.secretKey'),
        password: '',
      },
    }
    this.chargeUrl = `${this.config.get<string>('omise.domain')}`
    this.studentUrl = `${this.config.get<string>(
      'common.laravelUrl',
    )}/webhook/payment/omise`
  }

  async webhookOmise(payload: any, webhookData: IOmiseWebhookData): Promise<Observable<string>> {
    if (webhookData.status === 'successful') {
      if (webhookData.card) return await this.webhookOmiseFullCharge(payload, webhookData)
      if (webhookData.source) return await this.webhookOmiseInstallmentsCharge(payload, webhookData)
    }
  }

  async webhookOmiseInstallmentsCharge(
    payload: any,
    data: IOmiseWebhookData,
  ): Promise<Observable<string>> {
    const updateOrderStatusComplete: IUpdateOrderStatusComplete = {
      amount: data.amount / 100,
      bank: TransformTransactionBank[data.metadata.type],
      net: data.net / 100,
      installmentTerm: data.source.installmentTerm,
      gateway: TransactionGateway.OMISE,
      medthod: TransactionMethod.INSTALLMENT,
      type: TransactionType.income,
      orderCode: data.metadata.orderCode,
      instanceCode: data.metadata.instanceCode,
      webHookJson: payload,
    }

    this.eventEmitter.emit('order.createTransaction', updateOrderStatusComplete)
    payload.data.metadata.installmentBank = data.metadata.type

    return this.httpService
      .post(this.studentUrl, payload)
      .pipe(
        map(() => "ok"),
        catchError((err) => {
          this.logger.error(err)
          throw new BadGatewayException(
            `WebhookOmiseInstallmentsCharge error : ${err.message}`,
          )
        }),
        take(1),
      )
  }

  async webhookOmiseFullCharge(
    payload: any,
    data: IOmiseWebhookData,
  ): Promise<Observable<string>> {
    const updateOrderStatusComplete: IUpdateOrderStatusComplete = {
      amount: data.amount / 100,
      net: data.net / 100,
      installmentTerm: 0,
      gateway: TransactionGateway.OMISE,
      medthod: TransactionMethod.FULL,
      type: TransactionType.income,
      orderCode: data.metadata.orderCode,
      instanceCode: data.metadata.instanceCode,
      webHookJson: payload,
    }
    
    this.eventEmitter.emit('order.createTransaction', updateOrderStatusComplete)

    return this.httpService
      .post(this.studentUrl, payload)
      .pipe(
        map(() => "ok"),
        catchError((err) => {
          this.logger.error(err)
          throw new BadGatewayException(
            `WebhookOmiseFullCharge error : ${err.message}`,
          )
        }),
        take(1),
      )
  }

  async installmentsChargeCreditCard(
    payload: InstallmentsChargeCreditCardDto,
  ): Promise<Observable<IRedirectPayment>> {
    const orderInstance = await this.prisma.orderInstance.findUnique({
      where: {
        code: payload.instanceCode,
      },
    })

    if (orderInstance.status === OrderInstanceStatus.Complete) {
      this.logger.error('InstallmentsCharge already completed')
      throw new ConflictException(
        'InstallmentsChargeCreditCard error : InstallmentsCharge already completed',
      )
    }

    return this.httpService
      .post(
        `${this.chargeUrl}/charges`,
        {
          amount: orderInstance.amount * 100,
          currency: 'thb',
          metadata: {
            orderCode: payload.orderCode,
            instanceCode: payload.instanceCode,
            type: payload.bank,
            orderId: payload?.studentOrderId || undefined,
            orderIntanceId: payload?.studentInstanceId || undefined,
          },
          source: {
            type: payload.bank.toLocaleLowerCase(),
            installment_term: payload.installmentTerm,
          },
          card: payload.token,
          return_uri: `${this.config.get<string>(
            'common.studentUrl',
          )}/payment/${payload?.studentOrderId || payload.orderCode}/thankyou`,
        },
        this.configAxiosSecret,
      ).pipe(
        map((it) => ({ authorizeUrl: it.data.authorize_uri })),
        catchError((err) => {
          this.logger.error(err)
          throw new BadGatewayException(
            `InstallmentsChargeCreditCard error : ${err.message}`,
          )
        }),
        take(1),
      )
  }

  async chargeCreditCard(
    payload: ChargeCreditCardDto,
  ): Promise<Observable<IRedirectPayment>> {
    const orderInstance = await this.prisma.orderInstance.findUnique({
      where: {
        code: payload.instanceCode,
      },
    })

    if (orderInstance.status === OrderInstanceStatus.Complete) {
      this.logger.error('InstallmentsCharge already completed')
      throw new ConflictException(
        'ChargeCreditCard error : InstallmentsCharge already completed',
      )
    }

    return this.httpService
      .post(
        `${this.chargeUrl}/charges`,
        {
          amount: orderInstance.amount * 100,
          currency: 'thb',
          metadata: {
            orderCode: payload.orderCode,
            instanceCode: payload.instanceCode,
            orderId: payload?.studentOrderId || undefined,
            orderIntanceId: payload?.studentInstanceId || undefined
          },
          card: payload.token,
          return_uri: `${this.config.get<string>(
            'common.studentUrl',
          )}/payment/${payload?.studentOrderId || payload.orderCode}/thankyou`,
        },
        this.configAxiosSecret,
      ).pipe(
        map((it) => ({ authorizeUrl: it.data.authorize_uri })),
        catchError((err) => {
          this.logger.error(err)
          throw new BadGatewayException(
            `ChargeCreditCard error : ${err.message}`,
          )
        }),
        take(1),
      )
  }
}
