import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  IDoPaymentParamRequest2c2p,
  IDoPaymentResponse2c2p,
  IParamPaymentOptionDetail,
  IPaymentInfo2c2p,
  IPaymentTokenParamRequest2c2p,
  IPaymentTokenResponse2c2p,
} from '../interfaces/2c2p.interface'
import { INSTALLMENTS } from '../data/payment.data'
import {
  ChannelCode,
  CurrentcyCode,
  InterestType,
  StatusCode,
} from '../enums/2c2p.enum'
import * as jwt from 'jsonwebtoken'
@Injectable()
export class Payment2C2PService {
  private MERCHANT_ID = this.configService.get<string>('2c2p.merchantID')
  private SECRET_KEY = this.configService.get<string>('2c2p.secretKey')
  private BACKEND_WEBHOOK = this.configService.get<string>(
    '2c2p.backendReturnUrl',
  )
  private PAYMENT_URL = this.configService.get<string>('2c2p.paymentUrl')
  private APP_URL_STUDENT = this.configService.get<string>('common.studentUrl')
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {}

  async installmentPayment(
    data: IPaymentInfo2c2p,
  ): Promise<IDoPaymentResponse2c2p> {
    const {
      orderCode,
      amount,
      items,
      installmentBank,
      ownerId,
      instanceCode,
      studentOrderId,
      studentInstanceId,
    } = data
    //Find installment from our payment data
    const installmentInfo = INSTALLMENTS.find(
      (inst) => inst.type == installmentBank,
    )
    const tokenResponse = await this.getPaymentToken({
      amount: +amount.toFixed(2),
      merchantID: this.MERCHANT_ID,
      invoiceNo: `${orderCode}${instanceCode}`,
      description: items,
      currencyCode: CurrentcyCode.THAI,
      paymentChannel: [ChannelCode.INSTALLMENT_PLANT], // IPP is installment,
      interestType: InterestType.MONTH, // M = month, installment plane by month
      installmentPeriodFilter: [3, ...installmentInfo.installmentTerm],
      userDefined1: orderCode,
      userDefined2: ownerId,
      userDefined3: installmentBank,
      userDefined4: studentInstanceId || '',
      userDefined5: studentOrderId || '',
      backendReturnUrl: `${this.BACKEND_WEBHOOK}/${instanceCode}/Webhook`,
      frontendReturnUrl: `${this.APP_URL_STUDENT}/payment/${
        studentOrderId || orderCode
      }/thankyou`,
    })
    //for IPP : https://developer.2c2p.com/docs/direct-api-ipp-installment-payment-plan
    const payload: IDoPaymentParamRequest2c2p = {
      responseReturnUrl: `${this.APP_URL_STUDENT}/payment/${
        studentOrderId || data.orderCode
      }/thankyou`,
      payment: {
        code: {
          channelCode: ChannelCode.INSTALLMENT_PLANT,
          agentCode: installmentInfo.agentCode,
        },
        data: {
          name: data.ownerName,
          email: data.ownerEmail,
          mobileNo: data.ownerPhone,
          securePayToken: data.token,
          installmentPeriod: 3 || data.installmentTerm, //mock 3 month for testing
          interestType: InterestType.MONTH,
        },
      },
      paymentToken: tokenResponse?.paymentToken,
    } //Ignore clientIp
    return this.doPayment2C2P(payload)
  }

  /**
   * This function for get token from 2c2p with payload capsule that contain customer data sign with secret key
   * Source: https://developer.2c2p.com/docs/direct-api-method-3ds-card-payment
   * @param payload
   * @returns
   */
  async getPaymentToken(
    payload: IPaymentTokenParamRequest2c2p,
  ): Promise<IPaymentTokenResponse2c2p> {
    //Sign jwt for payload before get payment token from 2c2p
    const tokenPayload = jwt.sign(payload, this.SECRET_KEY)
    const body = {
      payload: tokenPayload,
    }
    try {
      const response = await this.httpService
        .post(`${this.PAYMENT_URL}/PaymentToken`, body)
        .toPromise()
      //If 2C2P response with payload then decode jwt token
      if (response?.data?.payload) {
        const decodeToken = this.decodePaylaod(
          response?.data?.payload,
        ) as IPaymentTokenResponse2c2p
        if (
          decodeToken?.respCode === StatusCode.SUCCESS &&
          decodeToken?.paymentToken
        ) {
          return decodeToken
        }
      }
      throw new Error(
        `2c2p.getPaymentToken: return 200 but ${JSON.stringify(
          response?.data,
        )}`,
      )
    } catch (err) {
      this.logger.error(err)
      throw new UnprocessableEntityException(
        'Cannot do payment please try again or contact to student support',
      )
    }
  }
  /**
   * This function required to call this API to request payment.
   * @param payload
   * @returns
   */
  async doPayment2C2P(
    payload: IDoPaymentParamRequest2c2p,
  ): Promise<IDoPaymentResponse2c2p> {
    try {
      const resDoPayment: { data: IDoPaymentResponse2c2p } =
        await this.httpService
          .post(`${this.PAYMENT_URL}/Payment`, payload)
          .toPromise()
      const { data: response } = resDoPayment
      if (response?.respCode === StatusCode.SUCCESS_REDIRECT_3D) {
        return response
      }
      throw new Error(
        `2c2p.doPayment2C2P: return 200 but ${JSON.stringify(response?.data)}`,
      )
    } catch (err) {
      this.logger.error(err)
      throw new UnprocessableEntityException(
        'Cannot do payment please try again or contact to student support',
      )
    }
  }
  /**
   * For get detail about payment before do payment (Optional)
   * @param payload
   * @returns
   */
  async getPaymentOptionDetails(payload: IParamPaymentOptionDetail) {
    try {
      const resPaymentOptionDetail = await this.httpService
        .post(`${this.PAYMENT_URL}/PaymentOptionDetails`, payload)
        .toPromise()
      return resPaymentOptionDetail?.data
    } catch (err) {
      this.logger.debug(err?.response)
      throw new UnprocessableEntityException(
        'Cannot do payment please try again or contact to student support',
      )
    }
  }

  decodePaylaod(payload: string) {
    try {
      return jwt.verify(payload, this.SECRET_KEY)
    } catch (err) {
      this.logger.error(`[Cannot decode payload 2c2p]: ${err}`)
      throw new Error('Cannot decode payload 2c2p')
    }
  }
}
