import { Student } from '../entities/student.entity'
import * as faker from 'faker'
import { Gender, Language } from '@auth-service/src/common/enums/auth.enum'

export const mockStudent = (partial: Partial<Student> = {}): Student => {
  const student: Student = {
    id: faker.datatype.number(9999),
    personalTitle: ['Mr.', 'Ms.', 'Mrs.'][faker.random.number(2)],
    fullname: faker.name.findName(),
    fullnameEn: faker.name.findName(),
    firstnameTh: faker.name.firstName(),
    firstnameEn: faker.name.firstName(),
    lastnameTh: faker.name.lastName(),
    lastnameEn: faker.name.lastName(),
    middlenameEn: faker.random.word(),
    nickname: faker.name.firstName(),
    nicknameEn: faker.name.firstName(),
    password: faker.internet.password(12),
    bcryptPassword: faker.internet.password(12),
    email: faker.internet.email(),
    phone: faker.phone.phoneFormats(),
    dob: faker.date.past(),
    address: faker.address.cardinalDirection(),
    lastLogin: faker.date.past(),
    gender: Object.values(Gender)[faker.datatype.number(1)],
    cefr: faker.name.title(),
    interest: faker.random.words(4),
    facebook: String(faker.datatype.number(16)),
    avatar: faker.internet.avatar(),
    globishLevel: null,
    country: faker.address.country(),
    language: Object.values(Language)[faker.datatype.number(2)],
    timezone: faker.address.timeZone(),
    type: faker.datatype.boolean() ? faker.datatype.number(10) : null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  }
  return Object.assign(student, partial)
}
