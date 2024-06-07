import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Admin } from './admin.entity'
import { Permission } from './permission.entity'
import { Team } from './team.entity'

@Entity('roles', { database: 'globish_admin' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'team_id' })
  teamId: number

  @Column()
  name: string

  @Column()
  description: string

  @Column({ name: 'created_by' })
  createdBy: number

  @Column({ name: 'updated_by' })
  updatedBy: number

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @OneToOne(() => Admin, (admin) => admin.role)
  admin?: Admin

  @ManyToOne(() => Team, (team) => team.roles)
  @JoinColumn({ name: 'team_id' })
  team?: Team

  @OneToMany(() => Admin, (admin) => admin.role)
  admins?: Admin[]

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[]
}
