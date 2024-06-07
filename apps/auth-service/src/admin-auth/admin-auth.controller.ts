import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { LoginDto } from '../common/dtos/auth.dto'
import { TAccessToken } from '../common/transforms/auth.transform'
import { ActiveAccountDto } from './dtos/admin-auth.dto'
import { AdminAuthService } from './services/admin-auth.service'

@ApiTags('Public/AdminAuth')
@Controller('Public/AdminAuth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiOkResponse({ type: TAccessToken })
  @Post('Login')
  login(@Body() data: LoginDto): Promise<TAccessToken> {
    return this.adminAuthService.login(data)
  }

  @ApiOkResponse({ type: TAccessToken })
  @Post('ActiveAccount')
  activeAccount(@Body() data: ActiveAccountDto): Promise<TAccessToken> {
    return this.adminAuthService.activeAccount(data.token)
  }
}
