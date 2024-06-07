import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import S3Service from './s3.service'
import S3 from './s3.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './libs/.env',
      load: [S3],
    }),
  ],
  controllers: [],
  providers: [Logger, S3Service],
  exports: [S3Service],
})
export class S3Module {}
