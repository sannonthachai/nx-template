import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber } from 'class-validator'

export class OrderItemDiscountJsonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  remark: string
}
