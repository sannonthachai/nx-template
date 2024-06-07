import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { Student } from './student.entity'

@Entity({ name: 'students_note' })
export class StudentNote {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'student_id' })
  studentId: number

  @Column({ name: 'name_en' })
  nameEn: string

  @Column({ name: 'ex_pronounce' })
  exPronounce: string

  @Column({ name: 'ex_grammar' })
  exGrammar: string

  @Column({ name: 'ex_homework' })
  exHomework: string

  @Column()
  q1: string

  @Column()
  q2: string

  @Column()
  q3: string

  @Column()
  device: string

  @Column({ default: '' })
  occupation!: string

  @Column({ default: '', name: 'sub_occupation' })
  subOccupation!: string

  @Column()
  industry: string

  @Column()
  school: string

  @Column()
  note: string

  @Column({ name: 'learning_preference' })
  learningPreference: string

  @Column({ default: '', name: 'pipedrive_note' })
  pipedriveNote!: string

  @Column({ name: 'mail_noti', enum: ['0', '1'] })
  mailNoti: '0' | '1'

  @Column({ name: 'line_notify' })
  lineNoti: string

  @Column({ name: 'chrome_noti', enum: ['0', '1'] })
  chromeNoti: '0' | '1'

  @Column({ name: 'created' })
  createdAt: Date

  @Column({ name: 'updated' })
  updatedAt: Date

  @OneToOne(() => Student, (student) => student.note)
  @JoinColumn({ name: 'student_id' })
  student?: Student
}
