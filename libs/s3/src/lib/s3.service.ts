import * as AWS from 'aws-sdk'
import { get } from 'lodash'
import * as crypto from 'crypto'
import * as path from 'path'
import { Injectable, Logger } from '@nestjs/common'
import { checkInitSlash } from '@globish-micro-service/helpers'
import { IInputFile } from './s3.interface'
import { moment } from '@globish-micro-service/moment'
import { ConfigService } from '@nestjs/config'

@Injectable()
export default class S3Service {
  private s3: AWS.S3

  constructor(private readonly logger: Logger, private config: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: config.get<string>('s3.accessKey'),
      secretAccessKey: config.get<string>('s3.secretKey'),
      region: 'ap-southeast-1',
    })
  }

  /**
   *
   * @param file : recieve file from client
   * @param filePath : determine file path
   * @param fileName : determine file name
   * @param fullPath : need full path link for open = true, if you want only path then determine false
   */
  async uploadFile(data: IInputFile): Promise<string> {
    const { file, filePath, fullPath, fileName } = data
    const originalname = get(file, 'originalname')
    const buffer = get(file, 'buffer')
    const name = `${filePath ? filePath + '/' : ''}${
      fileName
        ? fileName
        : moment().format('YYYYMMDD') +
          '_' +
          crypto.randomBytes(20).toString('hex') +
          path.extname(originalname)
    }`
    const params = {
      Bucket: this.config.get<string>('s3.bucket'),
      Key: name,
      Body: buffer,
    }
    const log = this.logger
    const urlCloudfront = this.config.get<string>('s3.cloudfront')
    return new Promise((resolve, reject) => {
      this.s3.upload(params, function(err: AWS.AWSError) {
        if (err) {
          log.error(err)
          reject(err)
        }
        resolve(fullPath ? `${urlCloudfront}/${name}` : name)
      })
    })
  }

  /**
   * remove file from aws s3 bucket.
   * @param nameFile The filename to remove from aws s3 bucket.
   */
  async removeFile(nameFile: string): Promise<boolean> {
    const log = this.logger
    return new Promise(resolve => {
      this.s3.deleteObject(
        {
          Bucket: this.config.get<string>('s3.bucket'),
          Key: checkInitSlash(nameFile).substr(1),
        },
        function(err: AWS.AWSError) {
          log.error(err)
          resolve(err === null)
        },
      )
    })
  }
}
