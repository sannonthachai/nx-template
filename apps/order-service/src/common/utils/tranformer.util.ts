import { ClassConstructor, plainToClass } from 'class-transformer'

export const transformPlain = <T>(
  tClass: ClassConstructor<T>,
  data: unknown,
): T => {
  return plainToClass(tClass, data, {
    excludeExtraneousValues: true,
    excludePrefixes: ['_'],
  })
}

export const transformPlainArr = <T>(
  tClass: ClassConstructor<T>,
  data: unknown[],
): T[] => {
  return plainToClass(tClass, data, {
    excludeExtraneousValues: true,
    excludePrefixes: ['_'],
  })
}
