import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { IAuthPayload } from '../interfaces/order.interface'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthPayload => {
    const request: Request = ctx.switchToHttp().getRequest()
    if (!request.headers['auth-token-payload'])
      throw new UnauthorizedException('Require auth-token-payload header')

    const auth: IAuthPayload = JSON.parse(
      `${request.headers['auth-token-payload']}`,
    )
    // return JSON.parse(`${request.headers['auth-token-payload']}, "clientIP": ${requestIp.getClientIp(request)}`)
    const clientIP = `${request.headers['x-forwarded-for']}`
    clientIP.split(',', 1)

    return {
      id: auth.id,
      role: auth.role,
      rToken: auth.rToken,
      country: auth.country,
      email: auth.email,
      name: auth.name,
      phone: auth.phone,
      userAgent: request.headers['user-agent'],
      clientIP,
      remoteAddr: `${request.headers['remote-addr']}`,
      httpXFor: `${request.headers['http-x-for']}`,
      upstreamAddr: `${request.headers['upstream-addr']}`,
    }
  },
)
