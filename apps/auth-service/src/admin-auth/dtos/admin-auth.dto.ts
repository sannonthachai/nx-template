import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class ActiveAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string
}
