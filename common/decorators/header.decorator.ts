import { ApiHeader } from '@nestjs/swagger'
import { NODE_ENV } from '../config'

export function HeadersDecorator() {
  if (NODE_ENV === "development") {
    return ApiHeader({
      name: 'auth-token-payload',
      description: `{"id":"1023","role":"student"}`,
      required: true
    })
  }
}