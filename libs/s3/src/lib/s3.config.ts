import { registerAs } from '@nestjs/config'

interface IS3Config {
  secretKey: string
  accessKey: string
  bucket: string
  cloudfront: string
  region: string
}

export default registerAs('s3', (): IS3Config => ({
  secretKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKey: process.env.AWS_ACCESS_KEY,
  bucket: process.env.AWS_BUCKET,
  cloudfront: process.env.AWS_URL_CLOUDFRONT,
  region: process.env.AWS_DEFAULT_REGION,
}))
