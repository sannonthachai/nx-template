import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OrderStatus, Prisma, TransactionBank } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { OrderInstanceDto } from './order-instance.dto'
import { OrderItemDto } from './order-item.dto'

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  ownerId: string

  @ApiProperty()
  @IsNotEmpty()
  ownerJson: Prisma.JsonValue

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discountTotal: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  witholdingTax: number

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf(({ terms }) => terms !== undefined)
  terms?: string

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf(({ remark }) => remark !== undefined)
  remark?: string

  @ApiPropertyOptional()
  @IsArray()
  @ValidateIf(({ tags }) => tags !== undefined)
  tags?: string[]

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  preTaxAmount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  vatAmount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  netAmount: number

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.WaitingPurchase,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus

  @ApiProperty()
  @IsDateString()
  @ValidateIf(({ issuedDate }) => issuedDate !== undefined)
  issuedDate: Date

  @ApiProperty()
  @IsDateString()
  @ValidateIf(({ dueDate }) => dueDate !== undefined)
  dueDate: Date

  @ApiProperty()
  @IsDateString()
  @ValidateIf(({ purchasedDate }) => purchasedDate !== undefined)
  purchasedDate: Date

  @ApiProperty({ type: [OrderInstanceDto] })
  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => OrderInstanceDto)
  orderInstances: Prisma.OrderInstanceCreateWithoutOrderInput[]

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => OrderItemDto)
  orderItems: Prisma.OrderItemCreateWithoutOrderInput[]
}

export class VerifySlipCompleteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderCode: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  instanceCode: string

  @ApiProperty({
    enum: TransactionBank,
    example: TransactionBank.BBL,
  })
  @IsNotEmpty()
  @IsEnum(TransactionBank)
  toBank: TransactionBank

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  transferSlipsId: number
}

export class VerifySlipVoidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderCode: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  instanceCode: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  transferSlipsId: number
}
