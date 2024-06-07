import { AdminStatus, Gender, Language, Roles } from '../enums/auth.enum'

export interface IAccessToken {
  accessToken: string
}

export interface IAuthPayload {
  id: number
  role: Roles
  rToken?: string
  name: string
  email: string
  phone: string
  country: string
}

export interface IUserMasterLogin {
  hashedPassword: string
  password: string
}

export interface ILanguage {
  th: string
  en: string
}
