import { AdminStatus, Country } from '@auth-service/src/common/enums/auth.enum'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Role } from './role.entity'
import { Team } from './team.entity'

@Entity('admins', { database: 'globish_admin' })
export class Admin {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'role_id' })
  roleId: number

  @Column({ name: 'team_id' })
  teamId: number

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  password: string

  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ type: 'simple-enum' })
  status: AdminStatus

  @Column()
  avatar: string

  @Column()
  phone: string

  @Column()
  dob: Date

  @Column({ type: 'simple-enum' })
  country: Country

  @Column({ name: 'manage_country' })
  manageCountry: string

  @Column({ name: 'last_login' })
  lastLogin: Date

  @Column({ name: 'remember_token' })
  rememberToken: string

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @OneToOne(() => Role, (role) => role.admin)
  @JoinColumn({ name: 'role_id' })
  role?: Role

  @OneToOne(() => Team, (team) => team.admin)
  @JoinColumn({ name: 'team_id' })
  team?: Team

  @ManyToOne(() => Team, (team) => team.admins)
  @JoinColumn({ name: 'team_id' })
  userTeam?: Team
}
