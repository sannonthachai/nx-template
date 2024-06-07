import { registerAs } from '@nestjs/config'

export interface IConfig2c2p {
  merchantID: string
  secretKey: string
  backendReturnUrl: string
  paymentUrl: string
}

export default registerAs(
  '2c2p',
  (): IConfig2c2p => ({
    merchantID: process.env.G_2C2P_MERCHANT_ID,
    secretKey: process.env.G_2C2P_SECRET_KEY,
    backendReturnUrl: process.env.G_2C2P_INSTALLMENT_WEBHOOK,
    paymentUrl: 'https://sandbox-pgw.2c2p.com/payment/4.1', //process.env.G_2C2P_URL,
  }),
)
