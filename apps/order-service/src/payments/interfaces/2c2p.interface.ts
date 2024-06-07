import { CategoryCode, ChannelCode } from '../enums/2c2p.enum'
import { IPaymentDesc } from './payment.interface'

export interface IPaymentInfo2c2p extends IPaymentDesc {
  amount: number
  cardHolderName: string
  token: string
  clientIP: string
  installmentBank?: string
  installmentTerm?: number
  studentOrderId?: string
  studentInstanceId?: string
}

export interface IPaymentTokenParamRequest2c2p {
  merchantID: string
  invoiceNo: string
  description: string
  amount: number
  interestType: string
  installmentPeriodFilter: number[]
  currencyCode: string
  paymentChannel: string[]
  tokenize?: boolean
  cardTokens?: string[]
  cardTokenOnly?: boolean
  userDefined1?: string
  userDefined2?: string
  userDefined3?: string
  userDefined4?: string
  userDefined5?: string
  frontendReturnUrl?: string
  backendReturnUrl?: string
}

export interface IPaymentTokenResponse2c2p {
  webPaymentUrl?: string
  paymentToken: string
  respCode: string
  respDesc: string
}

export interface IDoPaymentParamRequest2c2p {
  responseReturnUrl: string
  payment: {
    code: ICodeObject
    data: IDataObject
  }
  paymentToken: string
  clientIP?: string
}

interface ICodeObject {
  channelCode: string
  agentCode?: string //Ref: https://developer.2c2p.com/docs/reference-codes-agent-code
  agentChannelCode?: string
}

interface IDataObject {
  name?: string
  email?: string
  mobileNo?: string
  securePayToken: string
  installmentPeriod: number //installment term
  interestType: string
}

export interface IDoPaymentResponse2c2p {
  data: string
  channelCode: string
  respCode: string
  respDesc: string
}

export interface IParamPaymentOptionDetail {
  paymentToken: string
  groupCode: ChannelCode
  categoryCode: CategoryCode
}

export interface I2c2pWebhook {
  merchantID: string
  invoiceNo: string
  cardNo: string
  amount: number
  monthlyPayment: string
  userDefined1?: string
  userDefined2?: string
  userDefined3?: string
  userDefined4?: string
  userDefined5?: string // = studentOrderId
  respCode: string
  respDesc: string
  transactionDateTime: string
  agentCode: string
  channelCode: string
  issuerBank: string
  issuerCountry: string
  currencyCode: string
  cardToken: string
  tranRef: string
  referenceNo: string
  approvalCode: string
  installmentPeriod?: number
  interestRate?: number
  installmentMerchantAbsorbRate?: number
  paymentScheme?: string
  cardType?: string
  interestType?: string
}
