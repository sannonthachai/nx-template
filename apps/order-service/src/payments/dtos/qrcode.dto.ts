import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class QrCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instanceCode: string
}
