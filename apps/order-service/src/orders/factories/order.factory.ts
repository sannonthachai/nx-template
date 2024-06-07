import * as faker from 'faker'
import { Order, OrderStatus, Prisma } from '@prisma/client'

export const mockOrder = (partial: Partial<Order> = {}): Order => {
  const statusValue = Object.values(OrderStatus)
  const order: Order = {
    id: faker.datatype.number(9999),
    code: faker.random.word(),
    status: statusValue[faker.datatype.number(statusValue.length)],
    issuedDate: faker.date.past(),
    dueDate: faker.date.past(),
    purchasedDate: faker.date.past(),
    ownerId: `${faker.datatype.number(9999)}`,
    ownerJson: {
      fullnameEn: faker.name.firstName(),
      fullnameTh: faker.name.findName(),
      email: faker.internet.email(),
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
    } as Prisma.JsonValue,
    terms: faker.random.word(),
    remark: faker.random.word(),
    discountTotal: faker.datatype.number(9999),
    witholdingTax: faker.datatype.number(9999),
    preTaxAmount: faker.datatype.number(9999),
    vatAmount: faker.datatype.number(9999),
    netAmount: faker.datatype.number(9999),
    tags: [faker.random.word()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  }
  return Object.assign(order, partial)
}
