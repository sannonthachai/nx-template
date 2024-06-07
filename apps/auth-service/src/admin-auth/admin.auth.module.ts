import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtStrategy } from '../jwt.strategy'
import { SettingModule } from '../setttings/setting.module'
import { AdminAuthController } from './admin-auth.controller'
import { AdminRepository } from './repositories/admin.repository'
import { AdminAuthService } from './services/admin-auth.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminRepository]),
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
  controllers: [AdminAuthController],
  providers: [AdminAuthService, JwtStrategy],
  exports: [TypeOrmModule],
})
export class AdminAuthModule {}
