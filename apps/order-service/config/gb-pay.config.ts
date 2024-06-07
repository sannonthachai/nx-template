import { registerAs } from '@nestjs/config'

export interface IConfigGBPay {
  publicKey: string
  secretKey: string
  token: string
  backgroundUrl: string
  qrCodeUrl: string
}

export default registerAs(
  'gbpay',
  (): IConfigGBPay => ({
    publicKey: process.env.GBPAY_PUBLIC_KEY,
    secretKey: process.env.GBPAY_SECRET_KEY,
    token: process.env.GBPAY_TOKEN,
    backgroundUrl: process.env.GBPAY_WEBHOOK,
    qrCodeUrl: 'https://api.gbprimepay.com/gbp/gateway/qrcode',
  }),
)
