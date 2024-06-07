import {
  Injectable,
  NotFoundException,
  Logger,
  BadGatewayException,
} from '@nestjs/common'
import { IUpdateOrderStatusComplete } from '@order-service/src/common/interfaces/order.interface'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { Installment2c2pDto } from '../dtos/payment.dto'
import { QrCodeDto } from '../dtos/qrcode.dto'
import {
  I2c2pWebhook,
  IDoPaymentResponse2c2p,
} from '../interfaces/2c2p.interface'
import { IGetPaymentDesc, IPaymentDesc } from '../interfaces/payment.interface'
import { Payment2C2PService } from './2c2p.service'
import { QrcodeService } from './qrcode.service'
import {
  Prisma,
  TransactionGateway,
  TransactionMethod,
  TransactionType,
} from '@prisma/client'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IGbpayWebhook } from '../interfaces/qrcode.interface'
import { StatusCode } from '../enums/gb-pay.enum'
import { StatusCode as StatusCode2C2P } from '../enums/2c2p.enum'
import { TransformTransactionBank } from '../../orders/enums/transaction.enum'
import { HttpService } from '@nestjs/axios'
import { catchError, map, take } from 'rxjs/operators'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'
@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private qrCodeService: QrcodeService,
    private payment2c2pService: Payment2C2PService,
    private eventEmitter: EventEmitter2,
    private logger: Logger,
    private config: ConfigService,
  ) {}

  async getPaymentQrCode(payload: QrCodeDto): Promise<string> {
    const { instanceCode, orderCode } = payload
    const orderInstance = await this.getPaymentDescription(payload)
    return this.qrCodeService.generateQrcode({
      instanceCode,
      orderCode,
      amount: orderInstance.amount,
    })
  }

  async installment2c2p(
    payload: Installment2c2pDto,
    clientIP: string,
  ): Promise<IDoPaymentResponse2c2p> {
    const { instanceCode, orderCode } = payload
    const orderDesc = await this.getPaymentDescription({
      orderCode,
      instanceCode,
    })
    return this.payment2c2pService.installmentPayment({
      ...orderDesc,
      ...payload,
      clientIP,
    })
  }

  async webhookInstallment2c2p(
    instanceCode: string,
    { payload },
  ): Promise<Observable<string>> {
    const decodePaylaod = this.payment2c2pService.decodePaylaod(
      payload,
    ) as I2c2pWebhook

    let webhookLaravelPayload = {
      userDefined1: decodePaylaod.userDefined5, // studentOrderId
      userDefined2: decodePaylaod.userDefined3, // instalmentBank
      userDefined3: decodePaylaod.userDefined4, // studentOrderInstanceId
      amt: decodePaylaod.amount * 100,
      ippPeriod: decodePaylaod.installmentPeriod,
      status: "",
      tranRef: decodePaylaod.tranRef,
      type: "json"
    }

    if (decodePaylaod.respCode === StatusCode2C2P.SUCCESS) {
      const updateOrderStatusComplete: IUpdateOrderStatusComplete = {
        amount: decodePaylaod.amount,
        gateway: TransactionGateway.TWOCTWOP,
        installmentTerm: decodePaylaod.installmentPeriod,
        medthod: TransactionMethod.INSTALLMENT,
        net: decodePaylaod.amount,
        type: TransactionType.income,
        orderCode: decodePaylaod.userDefined1,
        instanceCode: instanceCode,
        webHookJson: decodePaylaod,
        bank: TransformTransactionBank[decodePaylaod?.userDefined3],
      }
      this.eventEmitter.emit(
        'order.createTransaction',
        updateOrderStatusComplete,
      )
      webhookLaravelPayload.status = "A"
    } else {
      this.logger.log({
        message: `2c2p webook failed: ${decodePaylaod}\nOrder Instance Code: ${instanceCode} status code ${payload?.respCode}`,
      })
      webhookLaravelPayload.status = "PF"
    }

    return this.httpService
      .post(
        `${this.config.get<string>(
          'common.laravelUrl',
        )}/webhook/payment/2c2p`,
        webhookLaravelPayload,
      )
      .pipe(
        map(() => "ok"),
        catchError((err) => {
          this.logger.error(err)
          throw new BadGatewayException(
            `WebhookInstallment2c2p error : ${err.message}`,
          )
        }),
        take(1),
      )
  }

  async webhookQrcode(
    instanceCode: string,
    payload: IGbpayWebhook,
  ): Promise<void> {
    if (payload.resultCode === StatusCode.SUCCESS) {
      const updateOrderStatusComplete: IUpdateOrderStatusComplete = {
        amount: payload.amount,
        gateway: TransactionGateway.GBPAY,
        installmentTerm: 0,
        medthod: TransactionMethod.QRCODE,
        net: payload.amount,
        type: TransactionType.income,
        orderCode: payload.detail,
        instanceCode: payload.referenceNo,
        webHookJson: payload,
      }
      this.eventEmitter.emit(
        'order.createTransaction',
        updateOrderStatusComplete,
      )
    } else {
      this.logger.log({
        message: `GBPAY webook failed: Order Instance Code: ${instanceCode} status code ${payload?.resultCode}`,
      })
    }
  }

  async getPaymentDescription(data: IGetPaymentDesc): Promise<IPaymentDesc> {
    const { instanceCode, orderCode } = data

    const order = await this.prisma.order.findUnique({
      where: {
        code: orderCode,
      },
      select: {
        orderItems: true,
        ownerId: true,
        ownerJson: true,
        remark: true,
        orderInstances: {
          where: {
            code: instanceCode,
          },
          select: {
            amount: true,
          },
        },
      },
    })

    if (!order?.orderInstances.length || !order) {
      throw new NotFoundException('This order payment not found!', 'NOT FOUND')
    }

    const packageName = order?.orderItems?.map((item) => item.name)
    const ownerInfo = order?.ownerJson as Prisma.JsonObject
    return {
      instanceCode,
      orderCode,
      remark: order.remark,
      items: packageName.join(', '),
      amount: order?.orderInstances?.[0].amount,
      ownerId: order.ownerId,
      ownerName: `${
        ownerInfo?.fullnameEn || ownerInfo?.fullnameTh || ownerInfo?.email
      }` as string,
      ownerEmail: ownerInfo?.email as string,
      ownerPhone: ownerInfo?.phone as string,
    }
  }
}
