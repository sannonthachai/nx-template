import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'settings' })
export class Setting {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  key: string

  @Column({ name: 'display_name' })
  displayName: string

  @Column()
  value: string

  @Column()
  details: string

  @Column()
  type: string

  @Column()
  order: number
}
