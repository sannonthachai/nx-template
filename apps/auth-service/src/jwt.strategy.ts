import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IAuthPayload } from './common/interfaces/auth.interface'
import { Roles } from './common/enums/auth.enum'
import { InjectRepository } from '@nestjs/typeorm'
import { AdminRepository } from './admin-auth/repositories/admin.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(AdminRepository)
    private adminRepo: AdminRepository,
    private config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    })
  }

  async validate(payload: IAuthPayload): Promise<IAuthPayload> {
    switch (payload.role) {
      case Roles.STUDENT:
        return payload
      case Roles.ADMIN:
        const userAdmin = await this.adminRepo.findOne({
          where: { id: payload.id },
        })

        if (!userAdmin || payload.rToken !== userAdmin.rememberToken) {
          throw new UnauthorizedException('Invalid token')
        } else if (!userAdmin.status) {
          throw new UnauthorizedException('Invalid status')
        }

        return payload
      default:
        throw new UnauthorizedException('Invalid role')
    }
  }
}
