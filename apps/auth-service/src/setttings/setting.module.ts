import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SettingRepository } from './repositories/setting.repository'
import { SettingService } from './serivces/setting.service'

@Module({
  imports: [TypeOrmModule.forFeature([SettingRepository])],
  providers: [SettingService],
  exports: [SettingService, TypeOrmModule],
})
export class SettingModule {}
