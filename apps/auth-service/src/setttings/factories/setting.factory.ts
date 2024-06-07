import * as faker from 'faker'
import { Setting } from '../entities/setting.entity'

export const mockSetting = (partial: Partial<Setting> = {}): Setting => {
  const setting: Setting = {
    id: faker.datatype.number(9999),
    key: [
      'space_for_all_by_student_id',
      'space_for_all_by_coach_id',
      'space_for_all_with_tokbox_by_student_id',
      'space_for_all_with_tokbox_by_coach_id',
      'set_room_url_for_student',
    ][faker.datatype.number(5)],
    displayName: [
      'Space For All by Student id',
      'Space For All by Coach id',
      'Space For All with Tokbox by Student id',
      'Space For All with Tokbox by Coach id',
      'Set url room for some student',
    ][faker.datatype.number(5)],
    value: [
      '122',
      '23333',
      '23601,6646,67578',
      '177',
      '[{"studentId": 5375, "url": "https://www.whereby.com/globish-room020", "version": "appear"},{ "studentId": 23601, "url": "https://www.whereby.com/globish-intermediate04", "version": "appear"}]',
    ][faker.datatype.number(5)],
    details: faker.random.word(),
    type: ['number', 'text'][faker.datatype.number(2)],
    order: 0,
  }
  return Object.assign(setting, partial)
}
