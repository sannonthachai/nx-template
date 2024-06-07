import { Country } from '@auth-service/src/common/enums/auth.enum'
import { SettingService } from '@auth-service/src/setttings/serivces/setting.service'
import { Test, TestingModule } from '@nestjs/testing'
import { StudentAuthService } from './student-auth.service'
import { mockStudent } from '../factories/student-auth.factory'
import { StudentRepository } from '../repositories/student-auth.repository'
import { JwtService } from '@nestjs/jwt'
const bcrypt = require('bcrypt') // ES5 import for mock inner function
jest.mock('bcrypt')

describe('StudentAuthService', () => {
  let service: StudentAuthService
  let settingService: SettingService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentRepository,
        StudentAuthService,
        { provide: JwtService, useValue: {} },
        { provide: SettingService, useValue: {} },
      ],
    }).compile()
    service = module.get<StudentAuthService>(StudentAuthService)
    settingService = module.get<SettingService>(SettingService)
  })

  describe('service.studentLogin', () => {
    it('should be throw error unexpected user', async () => {
      await expect(
        service.studentLogin({
          email: 'email@email.com',
          password: 'P4$$w0rD',
        }),
      ).rejects.toThrow('auth.ERROR_MESSAGE.UNEXPECTED_USER')
    })
    it('should throw error invalid password country th', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(false)
      service.verify = jest
        .fn()
        .mockImplementation(() => mockStudent({ id: 1707, country: 'th' }))
      await expect(
        service.studentLogin({
          email: 'email@globish.co.th',
          password: 'P4$$w0rD',
        }),
      ).rejects.toThrow('auth.ERROR_MESSAGE.INVALID_PASS')
    })
    it('should throw error invalid password when not match vn master pass', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(false)
      service.verify = jest
        .fn()
        .mockImplementation(() =>
          mockStudent({ id: 1707, country: Country.VN }),
        )
      service.getHashedMasterPassword = jest
        .fn()
        .mockReturnValue('$hashed-password')
      await expect(
        service.studentLogin({
          email: 'email@globish.co.th',
          password: 'masterpass',
        }),
      ).rejects.toThrow('auth.ERROR_MESSAGE.INVALID_PASS')
    })
    it('should valid password and sign token', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(true)
      service.verify = jest.fn().mockImplementation(() =>
        mockStudent({
          id: 1708,
          password:
            '$2a$10$XyMWltOrq2VvccgOU4o1K.C9gtJSRwMK/R0BkRF4Es3W4wekZCxgi',
          country: 'th',
          email: 'email@globish.co.th',
          firstnameEn: 'name',
          phone: '0881113333',
        }),
      )
      service.signStudentToken = jest
        .fn()
        .mockImplementation((data) => JSON.stringify(data))
      const result = await service.studentLogin({
        email: 'email@globish.co.th',
        password: 'P4$$w0rD',
      })
      expect(result).toBe(
        JSON.stringify({
          id: 1708,
          role: 'student',
          country: 'th',
          email: 'email@globish.co.th',
          name: 'name',
          phone: '0881113333',
        }),
      )
    })
    it('should valid password and sign token vn country', async () => {
      service.verify = jest.fn().mockImplementation(() =>
        mockStudent({
          id: 1708,
          country: Country.VN,
          email: 'email@globish.co.th',
          firstnameEn: 'name',
          phone: '0881113333',
        }),
      )
      service.getHashedMasterPassword = jest.fn().mockReturnValue(undefined)
      service.signStudentToken = jest
        .fn()
        .mockImplementation((data) => JSON.stringify(data))
      const result = await service.studentLogin({
        email: 'email@globish.co.th',
        password: 'masterpass',
      })
      expect(result).toBe(
        JSON.stringify({
          id: 1708,
          role: 'student',
          country: 'vn',
          email: 'email@globish.co.th',
          name: 'name',
          phone: '0881113333',
        }),
      )
    })
  })

  describe('service.getHashedMasterPassword', () => {
    it('should be hashedPassword when not found enabled master pass', async () => {
      settingService.getSettingByKey = jest.fn().mockReturnValue(null)
      const result = await service.getHashedMasterPassword({
        hashedPassword: '$hashed-password',
        password: 'password',
      })
      expect(result).toBe('$hashed-password')
    })
    it('should be hashedPassword when master pass not enabled', async () => {
      settingService.getSettingByKey = jest.fn().mockReturnValue('0')
      const result = await service.getHashedMasterPassword({
        hashedPassword: '$hashed-password',
        password: 'password',
      })
      expect(result).toBe('$hashed-password')
    })
    it('should be hashedPassword when not match master pass', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(false)
      settingService.getSettingByKey = jest
        .fn()
        .mockReturnValueOnce('1')
        .mockReturnValueOnce(null)
      const result = await service.getHashedMasterPassword({
        hashedPassword: '$hashed-password',
        password: 'password',
      })
      expect(result).toBe('$hashed-password')
    })
    it('should be undefined when match master pass', async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(true)
      settingService.getSettingByKey = jest
        .fn()
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('$hashed-vn-master-password')
      const result = await service.getHashedMasterPassword({
        hashedPassword: '$hashed-password',
        password: 'password',
      })
      expect(result).toBeUndefined()
    })
  })
})
