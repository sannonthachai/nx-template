import * as faker from 'faker'
import { OrderInstanceStatus, OrderInstance } from '@prisma/client'

export const mockOrderInstance = (
  partial: Partial<OrderInstance> = {},
): OrderInstance => {
  const statusValue = Object.values(OrderInstanceStatus)
  const orderInstance: OrderInstance = {
    id: faker.datatype.number(9999),
    code: faker.random.word(),
    orderId: faker.datatype.number(9999),
    amount: faker.datatype.number(9999),
    status: statusValue[faker.datatype.number(statusValue.length)],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  }
  return Object.assign(orderInstance, partial)
}
