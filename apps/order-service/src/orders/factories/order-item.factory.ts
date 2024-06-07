import * as faker from 'faker'
import { Prisma, OrderItem } from '@prisma/client'

export const mockOrderItem = (partial: Partial<OrderItem> = {}): OrderItem => {
  const orderItem: OrderItem = {
    id: faker.datatype.number(9999),
    itemId: faker.random.word(),
    name: faker.random.word(),
    orderId: faker.datatype.number(9999),
    price: faker.datatype.number(9999),
    vat: faker.datatype.number(9999),
    itemJson: {
      id: faker.datatype.number(9999),
      name: faker.random.word(),
    } as Prisma.JsonValue,
    description: faker.random.word(),
    discount: faker.datatype.number(9999),
    discountJson: {
      id: faker.datatype.number(9999),
      expire: faker.date.past(),
      code: faker.random.word(),
      available: faker.datatype.number(9999),
    } as unknown as Prisma.JsonValue,
    amount: faker.datatype.number(9999),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  }
  return Object.assign(orderItem, partial)
}
