export enum TransformTransactionGateway {
  'gb-pay' = 'GBPAY',
  'omise' = 'OMISE',
  '2c2p' = 'TWOCTWOP',
  'transfer' = 'TRANSFER',
}

export enum TransformTransactionMethod {
  'full-payment' = 'FULL',
  'transfer-payment' = 'TRANSFER',
  'qrcode-payment' = 'QRCODE',
  'installment-payment' = 'INSTALLMENT',
}

export enum TransformTransactionBank {
  'ktb' = 'KTB',
  'scb' = 'SCB',
  'kbank' = 'KBANK',
  'bbl' = 'BBL',
  'installment_bay' = 'INSTALLMENT_BAY',
  'installment_scb' = 'INSTALLMENT_SCB',
  'installment_citi' = 'INSTALLMENT_CITI',
  'installment_bbl' = 'INSTALLMENT_BBL',
  'installment_kbank' = 'INSTALLMENT_KBANK',
  'installment_uob' = 'INSTALLMENT_UOB',
  'installment_ktc' = 'INSTALLMENT_KTC',
  'installment_first_choice' = 'INSTALLMENT_FIRST_CHOICE',
  'installment_tbank' = 'INSTALLMENT_TBANK',
}
