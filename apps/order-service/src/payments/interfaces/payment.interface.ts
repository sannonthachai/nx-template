export interface IGetPaymentDesc {
  instanceCode: string
  orderCode: string
}

export interface IPaymentDesc extends IGetPaymentDesc {
  items: string
  amount: number
  ownerId: string
  ownerName?: string
  remark?: string
  ownerEmail?: string
  ownerPhone?: string
}
