import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IAuthPayload } from '@order-service/src/common/interfaces/order.interface'

@Injectable()
export class RequireRoles implements CanActivate {
  constructor( private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    )
    const request = context.switchToHttp().getRequest()

    if (!request.headers['auth-token-payload']) throw new UnauthorizedException('Require auth-token-payload header')
    
    const auth: IAuthPayload = JSON.parse(`${request.headers['auth-token-payload']}`)

    if (roles.some((value) => value === auth.role)) return true
    return false
  }
}