export interface IGenQrCode {
  orderCode: string
  amount: number
  instanceCode: string
}

export interface IGbpayWebhook {
  amount: number
  referenceNo: string
  gbpReferenceNo: string
  currencyCode: string
  resultCode: string
  totalAmount: number
  fee: number
  vat: number
  thbAmount: number
  date: string
  time: string
  paymentType: string
  detail?: string
}
