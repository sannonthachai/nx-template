import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestApplication, NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestApplication>(AppModule)

  /** enable cors */
  app.enableCors({
    // origin: [/\.globish\.co.th$/, /\.globish\.dev$/],
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })

  /** add swagger UI */
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  /** add validate pipe */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors): BadRequestException => {
        const errorMessages = {}
        errors.map((error) => {
          if (error?.constraints) {
            errorMessages[error?.property] = Object.values(error?.constraints)
              .join('. ')
              .trim()
          } else if (error?.children) {
            error?.children?.map((firstChild) => {
              const childError = {}
              firstChild?.children?.map((secondChild) => {
                childError[secondChild?.property] = Object.values(
                  secondChild?.constraints,
                )
                  .join('. ')
                  .trim()
              })
              errorMessages[error?.property] = childError
            })
          }
        })
        return new BadRequestException({
          error: 'Bad Request',
          inputError: errorMessages,
        })
      },
    }),
  )

  /** Get config */
  const configService = app.get(ConfigService)

  const logger = app.get(Logger)
  const PORT = configService.get('PORT')

  await app.listen(PORT)
  logger.log(
    `🚀 Server ready AUTH_SERVICE - db: ${process.env.DB_NAME} at http://localhost:${PORT}`,
  )
}
bootstrap()
