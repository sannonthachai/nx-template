import { LoginDto } from '@auth-service/src/common/dtos/auth.dto'
import {
  Country,
  EnabledVnMasterPass,
  Roles,
} from '@auth-service/src/common/enums/auth.enum'
import {
  IAccessToken,
  IAuthPayload,
  IUserMasterLogin,
} from '@auth-service/src/common/interfaces/auth.interface'
import { SettingService } from '@auth-service/src/setttings/serivces/setting.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { compareSync } from 'bcrypt'
import { Student } from '../entities/student.entity'
import { StudentRepository } from '../repositories/student-auth.repository'

@Injectable()
export class StudentAuthService {
  constructor(
    @InjectRepository(StudentRepository)
    private studentRepository: StudentRepository,
    private settingService: SettingService,
    private jwtService: JwtService,
  ) {}

  async studentLogin({ email, password }: LoginDto): Promise<IAccessToken> {
    /**
     * WARNING !!!
     * THIS CODE SHOULD ACTIVE ONLY "globish.dev"
     */
    if (!/@globish.co.th/.test(email)) {
      throw new UnauthorizedException('auth.ERROR_MESSAGE.UNEXPECTED_USER')
    }

    const student = await this.verify({ email })
    // set hashed password
    let hashedPassword = student.password.replace(/^\$2y(.+)$/i, '$2a$1')
    if (student.country === Country.VN) {
      hashedPassword = await this.getHashedMasterPassword({
        hashedPassword,
        password,
      })
    }

    // check if not match with master hashed password
    // then check with student hashed password
    if (hashedPassword) {
      const isValidPass = compareSync(password, hashedPassword)
      if (!isValidPass) {
        throw new UnauthorizedException('auth.ERROR_MESSAGE.INVALID_PASS')
      }
    }

    return this.signStudentToken({
      id: student.id,
      role: Roles.STUDENT,
      country: student.country,
      email: student.email,
      name: student.firstnameEn,
      phone: student.phone,
    })
  }

  async verify(
    findCondition: Partial<Student>,
    relations: string[] = [],
  ): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { ...findCondition },
      relations,
    })
    if (!student) {
      throw new UnauthorizedException('student.ERROR_MESSAGE.NO_STUDENT')
    }
    return student
  }

  async getHashedMasterPassword({
    hashedPassword,
    password,
  }: IUserMasterLogin): Promise<string> {
    const enabledMasterPass = await this.settingService.getSettingByKey(
      'enabled_vn_master_pass',
    )
    if (enabledMasterPass === EnabledVnMasterPass.ENABLED) {
      const hashedMasterPass = await this.settingService.getSettingByKey(
        'vn_master_pass',
      )
      return compareSync(password, hashedMasterPass || '')
        ? undefined // compare hashed success
        : hashedPassword
    }
    return hashedPassword
  }

  async signStudentToken(payload: IAuthPayload): Promise<IAccessToken> {
    return {
      accessToken: this.jwtService.sign(payload),
    }
  }
}
