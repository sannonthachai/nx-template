import { Test, TestingModule } from '@nestjs/testing'
import { SettingService } from './setting.service'
import { SettingRepository } from '../repositories/setting.repository'
import { mockSetting } from '../factories/setting.factory'

describe('SettingService', () => {
  let service: SettingService

  beforeEach(async () => {
    const MockModule: TestingModule = await Test.createTestingModule({
      providers: [SettingService, SettingRepository],
    }).compile()
    service = MockModule.get<SettingService>(SettingService)
  })

  describe('service.getSettingByKey', () => {
    it('should be return value', async () => {
      const setting = mockSetting({
        key: 'space_for_all_by_student_id',
        displayName: 'Space For All by Student id',
        value: `[{"studentId": 5375, "url": "https://www.whereby.com/globish-room020", "version": "appear"},{ "studentId": 23601, "url": "https://www.whereby.com/globish-intermediate04", "version": "appear"}]`,
      })
      SettingRepository.prototype.findOne = jest
        .fn()
        .mockResolvedValueOnce(setting)
      const result = await service.getSettingByKey(
        'space_for_all_by_student_id',
      )
      expect(result).toEqual(setting.value)
    })
    it('should be return emptry', async () => {
      SettingRepository.prototype.findOne = jest
        .fn()
        .mockResolvedValueOnce(null)
      const result = await service.getSettingByKey(
        'space_for_all_by_student_id_00',
      )
      expect(result).toEqual(null)
    })
  })

  describe('service.getSettingValueId', () => {
    it('should be return value', async () => {
      const setting = mockSetting({
        key: 'space_for_all_by_student_id',
        displayName: 'Space For All by Student id',
        value: `1,2,3`,
      })
      SettingRepository.prototype.findOne = jest
        .fn()
        .mockResolvedValueOnce(setting)
      const result = await service.getSettingValueId(
        'space_for_all_by_student_id',
      )
      expect(result).toEqual([1, 2, 3])
    })
    it('should be return emptry', async () => {
      SettingRepository.prototype.findOne = jest
        .fn()
        .mockResolvedValueOnce(null)
      const result = await service.getSettingValueId(
        'space_for_all_by_student_id_00',
      )
      expect(result).toEqual(null)
    })
    it('should get empty array', async () => {
      service.getSettingByKey = jest.fn().mockReturnValue('')
      const result = await service.getSettingValueId('key')
      expect(result).toEqual(null)
    })
    it('should get number array with many comma', async () => {
      service.getSettingByKey = jest.fn().mockReturnValue(',1, 2, , 3 , 4,')
      const result = await service.getSettingValueId('key')
      expect(result).toEqual([1, 2, 3, 4])
    })
    it('should get number array with some character string', async () => {
      service.getSettingByKey = jest.fn().mockReturnValue(',1a, 2, , 3 e, 4,')
      const result = await service.getSettingValueId('key')
      expect(result).toEqual([1, 2, 3, 4])
    })
  })
})
