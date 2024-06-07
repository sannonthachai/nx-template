import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  ValidateIf,
  IsNumberString,
} from 'class-validator'
import { OrderItemDiscountJsonDto } from './order-item-discount-json.dto'

export class OrderItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  itemId: string

  @ApiProperty({ example: {} })
  @IsNotEmpty()
  itemJson: Prisma.JsonObject

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  vat: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty({ example: {} })
  @ValidateIf(({ discountJson }) => discountJson !== undefined)
  discountJson: Prisma.JsonObject

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsString()
  @ValidateIf(({ description }) => description !== undefined)
  description: string

  @ApiPropertyOptional({
    type: OrderItemDiscountJsonDto,
    example: OrderItemDiscountJsonDto,
  })
  @IsOptional()
  @ValidateNested({ each: false })
  @Type(() => OrderItemDiscountJsonDto)
  orderItemDiscountJsons?: OrderItemDiscountJsonDto
}
