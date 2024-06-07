import { Injectable } from '@nestjs/common'
import { PrismaService } from '@order-service/src/prisma/prisma.service'
import { Order, PrismaPromise } from '@prisma/client'
import { IGetOrderRemark } from '../interfaces/order.interface'

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  getOrderByStudentId(studentId: string): PrismaPromise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        ownerId: studentId,
      },
      include: {
        orderInstances: {
          include: {
            transactions: true,
          },
        },
        orderItems: {
          include: {
            orderItemDiscountJsons: true,
          },
        },
      },
    })
  }

  getOrderByOrderCode(orderCode: string): PrismaPromise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        code: orderCode,
      },
      include: {
        orderInstances: {
          include: {
            transactions: true,
          },
        },
        orderItems: {
          include: {
            orderItemDiscountJsons: true,
          },
        },
      },
    })
  }
  /**
   * Remark is order id from student backend
   * @param remark
   * @returns
   */
  getOrderByRemark({
    orderId,
    studentId,
  }: IGetOrderRemark): PrismaPromise<Order> {
    return this.prisma.order.findFirst({
      where: {
        remark: orderId,
        ownerId: studentId,
      },
      include: {
        orderInstances: {
          include: {
            transactions: true,
          },
        },
        orderItems: {
          include: {
            orderItemDiscountJsons: true,
          },
        },
      },
    })
  }
}
