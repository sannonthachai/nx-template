import { ApiProperty } from '@nestjs/swagger'
import { IsEmailFormat } from '@root/common/decorators/is-email-format.decorator'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class LoginDto {
  @ApiProperty()
  @IsEmailFormat()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 32)
  password: string
}
