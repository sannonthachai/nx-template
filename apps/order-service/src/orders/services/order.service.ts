import {
  Injectable,
  UnprocessableEntityException,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateOrderDto } from '../dtos/order.dto'
import {
  IOrderInfo,
  IVerifySlipComplete,
  IVerifySlipVoid,
} from '../interfaces/order.interface'
import { addTime } from '@globish-micro-service/moment'
import { OrderRepository } from '../repositories/order.repository'
import {
  Prisma,
  TransactionGateway,
  TransactionMethod,
  TransactionType,
} from '@prisma/client'
import { randomInstanceCode, randomOrderCode } from '../helpers/code.helper'
import {
  Order,
  OrderInstanceStatus,
  OrderStatus,
  TransferStatus,
} from '@prisma/client'
import {
  ICreateTransferSlipVerification,
  IUpdateOrderStatusComplete,
  IUpdateOrderStatusVoid,
} from '@order-service/src/common/interfaces/order.interface'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private orderRepository: OrderRepository,
    private logger: Logger,
    private eventEmitter: EventEmitter2,
  ) {}

  async getOrderByStudentIdOrOrderCode(
    studentId: string,
    orderCode: string,
  ): Promise<Order[]> {
    if (studentId) {
      try {
        const order = await this.orderRepository.getOrderByStudentId(studentId)
        return order
      } catch (err) {
        this.logger.error(err)
        throw new InternalServerErrorException('GetOrderByStudentId error')
      }
    }

    if (orderCode) {
      try {
        const order = await this.orderRepository.getOrderByOrderCode(orderCode)
        return order
      } catch (err) {
        this.logger.error(err)
        throw new InternalServerErrorException('GetOrderByStudentId error')
      }
    }
  }

  async verifySlipComplete(payload: IVerifySlipComplete): Promise<void> {
    const { id, transferSlips, amount } =
      await this.prisma.orderInstance.findUnique({
        where: {
          code: payload.instanceCode,
        },
        select: {
          id: true,
          amount: true,
          transferSlips: {
            where: {
              id: payload.transferSlipsId,
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      })

    if (payload.amount !== amount) {
      this.logger.error('Incorrect amount')
      throw new ConflictException('VerifySlipComplete error : Incorrect amount')
    }

    if (transferSlips[0].status !== TransferStatus.WaitingApproval) {
      this.logger.error('TransferSlips status conflict')
      throw new ConflictException(
        'VerifySlipComplete error : TransferSlips status conflict',
      )
    }

    await this.transferSlipVerification({
      userId: payload.userId,
      userJson: payload.userJson,
      transferSlipId: transferSlips[0].id,
      status: TransferStatus.Approved,
    })

    const updateOrderStatusComplete: IUpdateOrderStatusComplete = {
      amount: payload.amount,
      bank: payload.toBank,
      gateway: TransactionGateway.TRANSFER,
      installmentTerm: 0,
      medthod: TransactionMethod.TRANSFER,
      net: payload.amount,
      type: TransactionType.income,
      orderCode: payload.orderCode,
      orderInstanceId: id,
      instanceCode: payload.instanceCode,
    }

    this.eventEmitter.emit('order.createTransaction', updateOrderStatusComplete)
  }

  async verifySlipVoid(payload: IVerifySlipVoid): Promise<void> {
    const { transferSlips } = await this.prisma.orderInstance.findUnique({
      where: {
        code: payload.instanceCode,
      },
      select: {
        transferSlips: {
          where: {
            id: payload.transferSlipsId,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (transferSlips[0].status !== TransferStatus.WaitingApproval) {
      this.logger.error('TransferSlips status conflict')
      throw new ConflictException(
        'VerifySlipVoid error : TransferSlips status conflict',
      )
    }

    await this.transferSlipVerification({
      userId: payload.userId,
      userJson: payload.userJson,
      transferSlipId: transferSlips[0].id,
      status: TransferStatus.Void,
    })

    const updateOrderStatusVoid: IUpdateOrderStatusVoid = {
      orderCode: payload.orderCode,
      instanceCode: payload.instanceCode,
    }

    this.eventEmitter.emit('order.UpdateOrderStatusVoid', updateOrderStatusVoid)
  }

  async updateOrderStatusVoid(orderCode: string): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          code: orderCode,
        },
      })
      await this.prisma.order.update({
        where: {
          code: orderCode,
        },
        data: {
          status: OrderStatus.Void,
          orderInstances: {
            updateMany: {
              where: {
                orderId: order.id,
              },
              data: {
                status: OrderInstanceStatus.Void,
              },
            },
          },
        },
      })
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `UpdateOrderStatusVoid error : ${err.message}`,
      )
    }
  }

  async updateOrderStatusRefund(orderCode: string): Promise<void> {
    try {
      await this.prisma.order.update({
        where: {
          code: orderCode,
        },
        data: {
          status: OrderStatus.Refund,
        },
      })
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `UpdateOrderStatusRefund error : ${err.message}`,
      )
    }
  }

  async transferSlipVerification(
    payload: ICreateTransferSlipVerification,
  ): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.transferSlipVerification.create({
          data: {
            userId: payload.userId,
            userJson: payload.userJson,
            transferSlipId: payload.transferSlipId,
          },
        }),
        this.prisma.transferSlip.update({
          where: {
            id: payload.transferSlipId,
          },
          data: {
            status: payload.status,
          },
        }),
      ])
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(
        `TransferSlipVerification error : ${err.message}`,
      )
    }
  }

  async createOrder(data: CreateOrderDto): Promise<IOrderInfo> {
    const {
      ownerId,
      ownerJson,
      terms,
      remark,
      discountTotal,
      witholdingTax,
      tags,
      preTaxAmount,
      vatAmount,
      netAmount,
      status,
      orderInstances,
      issuedDate,
      purchasedDate,
    } = data
    const payload = {
      ownerId,
      ownerJson,
      code: randomOrderCode(),
      terms,
      remark,
      discountTotal,
      witholdingTax,
      tags,
      preTaxAmount,
      vatAmount,
      netAmount,
      status,
      issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
      dueDate: issuedDate
        ? addTime(new Date(issuedDate), 7, 'd')
        : addTime(new Date(), 7, 'd'),
      purchasedDate: purchasedDate ? new Date(purchasedDate) : new Date(),
      orderInstances: {
        createMany: {
          data: orderInstances?.map((oi, i) => {
            return { ...oi, code: oi?.code || randomInstanceCode(i) }
          }),
        },
      },
    }

    try {
      const order = await this.prisma.order.create({
        data: payload,
        include: {
          orderInstances: true, // Include all posts in the returned object
        },
      })

      const orderItems = await Promise.all(
        data?.orderItems?.map((item) => {
          return this.prisma.orderItem.create({
            data: {
              ...item,
              orderId: order.id,
              orderItemDiscountJsons: {
                createMany: {
                  data: item?.orderItemDiscountJsons as Prisma.OrderItemDiscountJsonCreateWithoutOrderItemInput[],
                },
              },
            },
            include: {
              orderItemDiscountJsons: true,
            },
          })
        }),
      )
      return {
        ...order,
        orderItems,
      }
    } catch (err) {
      this.logger.error(err)
      throw new UnprocessableEntityException(err)
    }
  }

  async getOrCreateOrder(
    orderId: string,
    data: CreateOrderDto,
  ): Promise<Order> {
    const findOrderByRemark = await this.orderRepository.getOrderByRemark({
      orderId,
      studentId: data.ownerId,
    })

    if (findOrderByRemark) {
      return findOrderByRemark
    }

    return this.createOrder(data)
  }
}
