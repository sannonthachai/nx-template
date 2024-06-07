import { OrderInstanceStatus } from '.prisma/client'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'

export class OrderInstanceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number

  @ApiProperty({
    enum: OrderInstanceStatus,
    example: OrderInstanceStatus.WaitingPurchase,
  })
  @IsNotEmpty()
  @IsEnum(OrderInstanceStatus)
  status: OrderInstanceStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string
}
