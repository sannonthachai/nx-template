import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger'

@Controller()
export class AppController {
  @Get('Healthz')
  healthz(): string {
    return 'ok'
  }

  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('Introspection')
  introspection(@Request() req): string {
    return JSON.stringify(req.user)
  }
}
