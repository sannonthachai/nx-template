import { OrderInstance } from '@prisma/client'

export interface IRedirectPayment {
  authorizeUrl: string
}

export interface IGetPaymentDetail {
  code: string
  orderInstanceId: number
  instanceCode: string
}

export interface IPaymentDetail {
  orderInstance: OrderInstance
  sumPrice: number
}
