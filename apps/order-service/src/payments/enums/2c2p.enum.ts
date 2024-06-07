/**
 * For more infomation => https://developer.2c2p.com/docs/api-response-code
 */
export enum StatusCode {
  SUCCESS = '0000',
  SUCCESS_REDIRECT_3D = '1001',
  TOKEN_INVALID = '9040',
  VALUE_INVALID = '9004',
  INVOICE_EXIST = '9015',
  FAILED_INQUIRY = '2003',
}

export enum ChannelCode {
  CREDIT_CARD = 'CC',
  INSTALLMENT_PLANT = 'IPP',
}

export enum InterestType {
  MONTH = 'M',
}

export enum CurrentcyCode {
  THAI = 'THB',
  VIETNAM = 'VND',
  SINGAPORE = 'SGD',
}

export enum CategoryCode {
  GLOBAL_CARD = 'GCARD', //FOR CREDIT CARD
  QR_PAYMENT = 'QR', //FOR QR CODE
}
