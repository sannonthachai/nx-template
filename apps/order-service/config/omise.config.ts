import { registerAs } from '@nestjs/config'

export interface IConfigOmise {
  domain: string
  secretKey: string
}

export default registerAs(
  'omise',
  (): IConfigOmise => ({
    domain: process.env.OMISE_DOMAIN,
    secretKey: process.env.OMISE_SECRET_KEY,
  }),
)
