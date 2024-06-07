import {
  OrderInstanceStatus,
  OrderStatus,
  Prisma,
  TransactionBank,
  TransactionGateway,
  TransactionMethod,
  TransactionType,
  TransferStatus,
} from '@prisma/client'
import { Roles } from '../enums/order.enum'

export interface IAuthPayload {
  id: number
  role: Roles
  rToken?: string
  name: string
  email: string
  phone: string
  country: string
  clientIP: string
  userAgent: string
  httpXFor: string
  remoteAddr: string
  upstreamAddr: string
}

export interface IUpdateOrderStatusComplete {
  instanceCode: string
  orderCode: string
  amount: number
  medthod: TransactionMethod
  gateway: TransactionGateway
  net: number
  bank?: TransactionBank
  type: TransactionType
  installmentTerm: number
  orderInstanceId?: number
  webHookJson?: Prisma.JsonObject | any
}

export interface IUpdateOrderStatusWaitingApproval {
  instanceCode: string
  orderCode: string
  fromBank: string
  toBank: string
  slipPath: string
  amount: number
  orderInstanceId: number
  transferredAt: Date
}

export interface IUpdateOrderStatusVoid {
  instanceCode: string
  orderCode: string
}

export interface IUpdateOrderAndOrderInstance {
  instanceCode: string
  orderCode: string
  orderStatus: OrderStatus
  orderInstanceStatus: OrderInstanceStatus
}

export interface ICreateTransferSlipVerification {
  userId: string
  userJson: Prisma.JsonObject
  transferSlipId: number
  status: TransferStatus
}

export interface ICreateTransferSlipTransaction {
  orderInstanceId: number
  toBank: TransactionBank
  amount: number
}

export interface ITransaction {
  amount: number
  medthod: TransactionMethod
  gateway: TransactionGateway
  net: number
  bank?: TransactionBank
  type: TransactionType
  installmentTerm: number
  orderInstanceId: number
  webHookJson?: Prisma.JsonObject
}

export interface ITransferSlip {
  status: TransferStatus
  fromBank: string
  toBank: string
  slipPath: string
  amount: number
  orderInstanceId: number
  transferredAt: Date
}
