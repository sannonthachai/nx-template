import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

interface ExceptionError {
  status?: number
  error?: string
  message?: string
  response?: {
    status?: number
    statusCode?: number
    error?: string
    message?: string
    inputError?: JSON
  }
}
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: ExceptionError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status =
      exception.status ||
      exception?.response?.status ||
      exception?.response?.statusCode ||
      500
    const error = exception?.error || exception?.response?.error || 'ERROR'
    const message =
      exception?.response?.message ||
      exception?.message ||
      'INTERNAL_SERVER_ERROR'
    const inputError = exception?.response?.inputError
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: inputError || message,
      error,
    }
    Logger.error(
      `${request.method} ${
        request.url
      }`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    )
    response.status(status).json(errorResponse)
  }
}
