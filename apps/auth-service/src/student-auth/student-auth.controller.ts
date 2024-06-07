import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { LoginDto } from '../common/dtos/auth.dto'
import { IAccessToken } from '../common/interfaces/auth.interface'
import { TAccessToken } from '../common/transforms/auth.transform'
import { StudentAuthService } from './services/student-auth.service'

@ApiTags('Public/StudentAuth')
@Controller('Public/StudentAuth')
export class StudentAuthController {
  constructor(private readonly studentAuthService: StudentAuthService) {}

  @ApiOkResponse({ type: TAccessToken })
  @Post('Login')
  login(@Body() data: LoginDto): Promise<IAccessToken> {
    return this.studentAuthService.studentLogin(data)
  }
}
