import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Menu } from './menu.entity'
import { Role } from './role.entity'
import { Team } from './team.entity'

@Entity('permissions', { database: 'globish_admin' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column({ name: 'action_name' })
  actionName: string

  @Column({ name: 'main_menu_id' })
  mainMenuId: number

  @Column({ name: 'sub_menu_id' })
  subMenuId: number

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Role, (role) => role.permissions)
  roles?: Role[]

  @ManyToMany(() => Team, (team) => team.permissions)
  teams?: Team[]

  @ManyToOne(() => Menu, (menu) => menu.subMenus)
  @JoinColumn({ name: 'sub_menu_id' })
  subMenus?: Menu

  @ManyToOne(() => Menu, (mn) => mn.mainMenu)
  @JoinColumn({ name: 'main_menu_id' })
  mainMenu?: Menu

  @ManyToOne(() => Menu, (mn) => mn.subMenu)
  @JoinColumn({ name: 'sub_menu_id' })
  subMenu?: Menu
}
