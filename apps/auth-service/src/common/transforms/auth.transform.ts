import { ApiResponseProperty } from '@nestjs/swagger'

export class TAccessToken {
  @ApiResponseProperty()
  accessToken: string
}
