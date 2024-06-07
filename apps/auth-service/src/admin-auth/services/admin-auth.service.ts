import { LoginDto } from '@auth-service/src/common/dtos/auth.dto'
import { AdminStatus, Roles } from '@auth-service/src/common/enums/auth.enum'
import { TAccessToken } from '@auth-service/src/common/transforms/auth.transform'
import { alphaNumeric } from '@auth-service/src/common/utils/random.util'
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { compareSync } from 'bcrypt'
import { Admin } from '../entities/admin.entity'
import { AdminRepository } from '../repositories/admin.repository'

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminRepository)
    private adminRepo: AdminRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login({ email, password }: LoginDto): Promise<TAccessToken> {
    const admin = await this.adminRepo.findOne({ email })
    if (!admin) {
      throw new UnauthorizedException('User admin does not exist')
    }
    if (admin.status === AdminStatus.DEACTIVATE) {
      throw new ForbiddenException('User admin is not activated yet')
    }
    // if valid password
    const isValidPass = compareSync(password, admin.password)
    if (isValidPass) {
      /**
       * store remember token and stamp last login
       */
      const rToken = admin.rememberToken || alphaNumeric(32)
      await this.adminRepo.save(
        this.adminRepo.create({
          ...admin,
          lastLogin: new Date(),
          rememberToken: rToken,
        }),
      )
      /**
       * sing JWT and response accessToken
       */
      const accessToken = this.jwtService.sign({
        id: admin.id,
        role: Roles.ADMIN,
        rToken,
        name: admin.firstname,
        email: admin.email,
        phone: admin.phone,
        country: admin.country,
      })
      return { accessToken }
    }
    // if not throw unauthorized error
    throw new UnauthorizedException('Invalid password')
  }

  async activeAccount(token: string): Promise<TAccessToken> {
    let admin: Admin
    try {
      const jwtString = Buffer.from(token, 'base64').toString()
      const payload = this.jwtService.verify<{ email: string }>(jwtString, {
        secret: this.configService.get<string>('jwt.secret'),
      })
      admin = await this.adminRepo.findOne({ email: payload?.email })
    } catch (error) {
      throw new UnprocessableEntityException(error)
    }
    // check if user admin does not exist
    if (!admin) {
      throw new UnauthorizedException('User admin does not exist')
    }
    // update user admin status
    const rToken = alphaNumeric(32)
    admin = await this.adminRepo.save({
      status: AdminStatus.ACTIVATE,
      rememberToken: rToken,
      lastLogin: new Date(),
      id: admin.id,
    })
    /**
     * sing JWT and response accessToken
     */
    const accessToken = this.jwtService.sign({
      id: admin.id,
      rToken,
    })
    return { accessToken }
  }
}
