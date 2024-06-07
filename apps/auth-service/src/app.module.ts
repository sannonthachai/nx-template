import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AppController } from './app.controller'
import { HttpExceptionFilter } from '@root/common/filters/http-exception.filter'
import { LoggingInterceptor } from '@root/common/interceptors/logging.interceptor'
import { TransformInterceptor } from '@root/common/interceptors/transform.interceptor'
import { DatabaseModule } from './database/database.module'
import CommonConfig from '@auth-service/config/common.config'
import DatabaseConfig from '@auth-service/config/database.config'
import JwtConfig from '@auth-service/config/jwt.config'
import { StudentAuthModule } from './student-auth/student-auth.module'
import { SettingModule } from './setttings/setting.module'
import { AdminAuthModule } from './admin-auth/admin.auth.module'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: './apps/auth-service/.env',
      load: [CommonConfig, DatabaseConfig, JwtConfig],
    }),
    StudentAuthModule,
    AdminAuthModule,
    SettingModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
