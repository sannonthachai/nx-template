import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SettingRepository } from '../repositories/setting.repository'

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingRepository)
    private settingRepo: SettingRepository,
  ) {}

  async getSettingByKey(key: string): Promise<string> {
    const setting = await this.settingRepo.findOne({
      where: {
        key: key,
      },
      select: ['value'],
    })
    return setting?.value || null
  }

  async getSettingValueId(key: string): Promise<number[]> {
    const getValue = await this.getSettingByKey(key)
    if (!getValue) return null
    return getValue
      .split(',')
      .filter((id) => !!id.trim())
      .map((id) => parseInt(id))
  }
}
