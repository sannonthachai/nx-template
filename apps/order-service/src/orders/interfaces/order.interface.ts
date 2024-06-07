import {
  Order,
  OrderInstance,
  OrderItem,
  Prisma,
  TransactionBank,
} from '@prisma/client'

export interface IOrderInfo extends Order {
  orderInstances: OrderInstance[]
  orderItems: OrderItem[]
}

export interface IVerifySlipComplete {
  orderCode: string
  instanceCode: string
  userId: string
  userJson: Prisma.JsonObject
  toBank: TransactionBank
  amount: number
  transferSlipsId: number
}

export interface IVerifySlipVoid {
  orderCode: string
  instanceCode: string
  userJson: Prisma.JsonObject
  userId: string
  transferSlipsId: number
}

export interface IGetOrderRemark {
  orderId: string
  studentId: string
}
