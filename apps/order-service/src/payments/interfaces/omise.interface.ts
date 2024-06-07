import { TransactionBank } from "@prisma/client";

export interface IOmiseWebhookData {
  amount: number
  net: number
  metadata: IOmiseMetaData
  status: string
  card?: any
  source?: IOmiseSource
}

export interface IOmiseSource {
  installmentTerm: number
}

export interface IOmiseMetaData {
  orderCode: string
  instanceCode: string
  type: TransactionBank,
  studentOrderId: string
  studentInstanceId: string
}