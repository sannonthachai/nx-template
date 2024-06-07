import { moment } from '@globish-micro-service/moment'
import { alphaNumeric } from '@globish-micro-service/utils'

/**
 * LENGTH = 12-13
 * @param index nunber of instance
 * @returns
 */
export const randomInstanceCode = (index: number) => {
  return `${moment().format('YYMMDD')}${alphaNumeric()}${index}`
}

/**
 * LENGTH = 17
 * @returns
 */
export const randomOrderCode = () => {
  return `GBA${moment().format('YYYYMMDD')}${alphaNumeric()}`
}
