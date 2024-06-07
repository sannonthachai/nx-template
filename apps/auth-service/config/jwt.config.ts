import { registerAs } from '@nestjs/config'

interface IJwtConfig {
  secret: string
  expire: string
}

export default registerAs(
  'jwt',
  (): IJwtConfig => ({
    secret: process.env.JWT_SECRET_KEY,
    expire: '1d',
  }),
)
