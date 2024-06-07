import { registerAs } from '@nestjs/config'
interface ICommonConfig {
  port: number
  nodeEnv: string
  studentUrl: string
  laravelUrl: string
}

export default registerAs(
  'common',
  (): ICommonConfig => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV,
    studentUrl: process.env.APP_URL_STUDENT,
    laravelUrl: process.env.APP_URL_LARAVEL,
  }),
)
