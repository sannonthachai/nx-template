import { Gender, Language } from '@auth-service/src/common/enums/auth.enum'
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { StudentType } from '../enums/student-auth.enum'
import { StudentNote } from './student-note.entity'

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  password: string

  @Column({ name: 'bcrypt_password' })
  bcryptPassword: string

  @Column({ name: 'personal_title' })
  personalTitle: string

  @Column()
  fullname: string

  @Column({ name: 'fullname_en' })
  fullnameEn: string

  @Column({ name: 'firstname_th' })
  firstnameTh: string

  @Column({ name: 'firstname_en' })
  firstnameEn: string

  @Column({ name: 'lastname_th' })
  lastnameTh: string

  @Column({ name: 'lastname_en' })
  lastnameEn: string

  @Column({ name: 'middlename_en' })
  middlenameEn: string

  @Column({ name: 'nickname_th' })
  nickname: string

  @Column({ name: 'nickname' })
  nicknameEn: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column({ type: 'simple-enum' })
  gender: Gender

  @Column()
  dob: Date

  @Column()
  address: string

  @Column({ name: 'last_login' })
  lastLogin: Date

  @Column()
  interest: string

  @Column()
  facebook: string

  @Column()
  avatar: string

  @Column()
  country: string

  @Column({ default: 'th', type: 'simple-enum' })
  language: Language

  @Column()
  timezone: string

  @Column({ type: 'simple-enum' })
  type: StudentType

  @Column()
  cefr: string

  @Column({ name: 'globish_level' })
  globishLevel: string

  @Column({ name: 'referrer_code' })
  referrerCode?: string

  @Column({ name: 'referee_code' })
  refereeCode?: string

  @Column({ name: 'created' })
  createdAt: Date

  @Column({ name: 'updated' })
  updatedAt: Date

  @OneToOne(() => StudentNote, (note) => note.student)
  note?: StudentNote
}
