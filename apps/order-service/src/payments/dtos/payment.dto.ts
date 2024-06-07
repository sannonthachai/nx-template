import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TransactionBank } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateIf,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNumberString,
} from 'class-validator'

export class CreateTransferDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderCode: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  instanceCode: string

  @ApiProperty({ type: 'file' })
  @ValidateIf(({ slip }) => slip !== undefined)
  slip: File[]

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fromBank: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  toBank: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  transferredAt: Date
}

export class Installment2c2pDto {
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
  @IsString()
  token: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardHolderName: string

  @ApiProperty({
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  installmentTerm: number

  @ApiProperty({
    // enum: TransactionBank,
    example: 'installment_scb, installment_citi, installment_uob',
  })
  // @Transform(({ obj }) => obj?.installmentBank?.toLocaleUpperCase())
  @IsNotEmpty()
  @IsString()
  // @IsEnum(TransactionBank)
  installmentBank: TransactionBank

  @ApiPropertyOptional({
    example: 12343,
  })
  @IsOptional()
  @IsNumberString()
  @ValidateIf(({ studentOrderId }) => studentOrderId !== undefined)
  studentOrderId?: string

  @ApiPropertyOptional({
    example: 12343,
  })
  @IsOptional()
  @IsNumberString()
  @ValidateIf(({ studentInstanceId }) => studentInstanceId !== undefined)
  studentInstanceId?: string
}

export class ChargeCreditCardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instanceCode: string

  @ApiPropertyOptional({
    example: 12343,
  })
  @IsOptional()
  @IsNumberString()
  @ValidateIf(({ studentOrderId }) => studentOrderId !== undefined)
  studentOrderId?: string

  @ApiPropertyOptional({
    example: 12343,
  })
  @IsOptional()
  @IsNumberString()
  @ValidateIf(({ studentInstanceId }) => studentInstanceId !== undefined)
  studentInstanceId?: string
}

export class InstallmentsChargeCreditCardDto extends ChargeCreditCardDto {
  @ApiProperty({
    // enum: TransactionBank,
    example: 'installment_scb',
  })
  @IsNotEmpty()
  @IsString()
  // @IsEnum(TransactionBank)
  bank: TransactionBank

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  installmentTerm: number
}
