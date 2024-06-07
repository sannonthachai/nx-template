import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IUpdateOrderStatusWaitingApproval } from '@order-service/src/common/interfaces/order.interface'
import { IRedirectPayment } from '@order-service/src/common/interfaces/payment.interface'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { OrderInstance, OrderInstanceStatus } from '@prisma/client'
import S3Service from '@root/libs/s3/src/lib/s3.service'
import { CreateTransferDto } from '../dtos/payment.dto'

@Injectable()
export class TransferService {
  constructor(
    private readonly logger: Logger,
    private prisma: PrismaService,
    private config: ConfigService,
    private s3Service: S3Service,
    private eventEmitter: EventEmitter2,
  ) {}

  async transferPaymentOrder(
    data: CreateTransferDto,
  ): Promise<IRedirectPayment> {
    const { instanceCode, orderCode, slip, fromBank, toBank, transferredAt } =
      data
    let slipPath: string
    let orderInstance: OrderInstance

    try {
      orderInstance = await this.prisma.orderInstance.findUnique({
        where: {
          code: instanceCode,
        },
      })

      if (orderInstance.status !== OrderInstanceStatus.WaitingPurchase) {
        throw new ConflictException(
          'TransferPaymentOrder error : Order instance invalid status',
        )
      }

      //Upload slip
      slipPath = await this.s3Service.uploadFile({
        file: slip,
        filePath: 'student/slip',
      })
    } catch (err) {
      this.logger.error(err)
      if (err instanceof ConflictException) throw err
      throw new InternalServerErrorException(
        `TransferPaymentOrder error : ${err.message}`,
      )
    }

    const updateOrderStatusWaitingApproval: IUpdateOrderStatusWaitingApproval =
      {
        orderCode,
        instanceCode,
        slipPath,
        fromBank,
        toBank,
        amount: orderInstance.amount,
        orderInstanceId: orderInstance.id,
        transferredAt,
      }

    this.eventEmitter.emit(
      'order.updateOrderStatusWaitingApproval',
      updateOrderStatusWaitingApproval,
    )

    return {
      authorizeUrl: `${this.config.get<string>(
        'common.studentUrl',
      )}/payment/${orderCode}/thankyou`,
    }
  }
}
