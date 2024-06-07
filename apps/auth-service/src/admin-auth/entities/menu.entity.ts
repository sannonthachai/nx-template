import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Permission } from './permission.entity'

@Entity('menus', { database: 'globish_admin' })
export class Menu {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ name: 'reference_id' })
  referenceId: number

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Menu, (mn) => mn.mainMenu)
  @JoinColumn({ name: 'id' })
  subMenus?: Menu[]

  @ManyToOne(() => Menu, (mn) => mn.subMenus)
  @JoinColumn({ name: 'reference_id' })
  mainMenu?: Menu

  @OneToMany(() => Permission, (permission) => permission.subMenus)
  permissions?: Permission[]

  @ManyToOne(() => Menu, (mn) => mn.subMenu)
  @JoinColumn({ name: 'reference_id' })
  subMenu?: Menu
}
