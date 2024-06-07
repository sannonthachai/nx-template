import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Admin } from './admin.entity'
import { Permission } from './permission.entity'
import { Role } from './role.entity'

@Entity('teams', { database: 'globish_admin' })
export class Team {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @OneToOne(() => Admin, (admin) => admin.team)
  admin?: Admin

  @OneToMany(() => Role, (role) => role.team)
  roles?: Role[]

  @OneToMany(() => Admin, (admin) => admin.userTeam)
  admins?: Admin[]

  @ManyToMany(() => Permission, (permission) => permission.teams, {
    cascade: true,
  })
  @JoinTable({
    name: 'team_permissions',
    joinColumn: { name: 'team_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions?: Permission[]
}
