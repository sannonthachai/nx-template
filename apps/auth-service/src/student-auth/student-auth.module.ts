import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminRepository } from '../admin-auth/repositories/admin.repository'
import { JwtStrategy } from '../jwt.strategy'
import { SettingModule } from '../setttings/setting.module'
import { StudentRepository } from './repositories/student-auth.repository'
import { StudentAuthService } from './services/student-auth.service'
import { StudentAuthController } from './student-auth.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentRepository, AdminRepository]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expire'),
        },
      }),
      inject: [ConfigService],
    }),
    SettingModule,
  ],
  controllers: [StudentAuthController],
  providers: [StudentAuthService, JwtStrategy],
  exports: [TypeOrmModule],
})
export class StudentAuthModule {}
