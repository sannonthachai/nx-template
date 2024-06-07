import { registerDecorator, ValidationOptions } from 'class-validator'

export function IsEmailFormat(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'isEmailFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions
        ? validationOptions
        : { message: `${propertyName} must be email format` },
      validator: {
        validate(value: string) {
          const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
          return regEx.test(value)
        },
      },
    })
  }
}
