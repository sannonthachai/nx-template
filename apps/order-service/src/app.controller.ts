import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/Healthz')
  healthz(): string {
    return 'ok'
  }
}
