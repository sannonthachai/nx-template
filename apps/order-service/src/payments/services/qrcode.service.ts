import { alphaNumeric } from '@globish-micro-service/utils'
import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { stringify } from 'querystring'
import { IGenQrCode } from '../interfaces/qrcode.interface'

@Injectable()
export class QrcodeService {
  private config: AxiosRequestConfig
  private GBPAY_TOKEN = this.configService.get<string>('gbpay.token')
  private GBPAY_WEBHOOK = this.configService.get<string>('gbpay.backgroundUrl')
  private GBPAY_QRCODE_URL = this.configService.get<string>('gbpay.qrCodeUrl')
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {
    this.config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }
  }

  async generateQrcode(payload: IGenQrCode): Promise<string> {
    const { orderCode, amount, instanceCode } = payload
    // 📌 referenceNo length mustk less than or equal 15
    const body = stringify({
      amount,
      token: this.GBPAY_TOKEN,
      backgroundUrl: `${this.GBPAY_WEBHOOK}/${instanceCode}/Webhook`,
      referenceNo: `${instanceCode}-${alphaNumeric(2)}`,
      detail: orderCode,
    })
    let response: AxiosResponse<ArrayBuffer>
    try {
      response = await this.httpService
        .post(this.GBPAY_QRCODE_URL, body, {
          ...this.config,
          responseType: 'arraybuffer',
        })
        .toPromise()
      const base64 = Buffer.from(response?.data).toString('base64')
      const mimeType = 'image/png'

      return `data:${mimeType};base64,${base64}`
    } catch (err) {
      this.logger.error(`QRCODE ERROR: ${JSON.stringify(err?.response)}`)
      throw new UnprocessableEntityException(err?.response?.data)
    }
  }
}
