import * as mtz from 'moment-timezone'
import { DurationInputArg2 } from 'moment-timezone'

export const moment = mtz
export const TZ = moment.tz.guess()

/**
 * now format YYYY-MM-DD
 */
export const getDate = (date = new Date(), tz = 'Asia/Bangkok'): string => {
  return mtz.tz(date, tz).format('YYYY-MM-DD')
}

/**
 * now format ISO format
 */
export const getDateISO = (
  date: string | Date | undefined = undefined,
  tz = 'Asia/Bangkok',
): Date => {
  const serverTime = date ? mtz(new Date(date)) : mtz()
  const convertedTz = serverTime.clone().tz(tz)
  return convertedTz.toDate()
}

/**
 * funtion addTime
 * * function add time
 * @param date
 * @param amount
 * @param unit
 */
export const addTime = (
  date: Date | string,
  amount: number,
  unit: DurationInputArg2,
): Date => {
  return moment(date).add(amount, unit).toDate()
}

/**
 * funtion subTime
 * * function add time
 * @param date
 * @param amount
 * @param unit
 */
export const subTime = (
  date: Date | string,
  amount: number,
  unit: DurationInputArg2,
): Date => {
  return moment(date).subtract(amount, unit).toDate()
}

/**
 * funtion momentConvertResponseTimezone
 * * converted datetime by studetn timezone
 * @param date
 * @param timezone
 */
export const momentConvertResponseTimezone = (
  date: Date | string | undefined = undefined,
): mtz.Moment => {
  let tzOffset = mtz.tz(TZ).utcOffset()
  // Asia/Bangkok = 420 for our database +07:00
  tzOffset = mtz(mtz(date).valueOf() + tzOffset * 60 * 1000).valueOf()
  return mtz(tzOffset)
}

export const strNumToDate = ({
  date,
  time,
}: {
  date: string
  time: string
}): Date => {
  const formatDate = /(\d{2})(\d{2})(\d{4})/g
  const formatTime = /(\d{2})(\d{2})(\d{2})/g
  const resultDate = date.replace(formatDate, '$3-$2-$1')
  const resultTime = time.replace(formatTime, '$1:$2:$3')
  return moment(`${resultDate} ${resultTime}`).toDate()
}

export const startDayOfNow = (tz = 'Asia/Bangkok'): Date => {
  return mtz.tz(tz).startOf('day').toDate()
}

export const localeTh = (
  date: Date | string | undefined = undefined,
  tz?: string
): mtz.Moment => {
  return mtz(date || new Date)
    .tz(tz || 'Asia/Bangkok')
    .add(543, 'y')
    .locale('th')
}

export const isAfterNow = (date: Date, tz = 'Asia/Bangkok'): boolean => {
  return mtz.tz(date, tz).isAfter(mtz.tz(tz))
}

export const isBeforeNow = (date: Date, tz = 'Asia/Bangkok'): boolean => {
  return mtz.tz(date, tz).isBefore(mtz.tz(tz))
}

export const addDtBeforeNow = (
  date: Date,
  amount: mtz.DurationInputArg1,
  unit: mtz.unitOfTime.DurationConstructor,
  tz = 'Asia/Bangkok',
): boolean => {
  return mtz.tz(date, tz).add(amount, unit).isBefore(mtz.tz(tz))
}

export const subDtBeforeNow = (
  date: Date,
  amount: mtz.DurationInputArg1,
  unit: mtz.unitOfTime.DurationConstructor,
  tz = 'Asia/Bangkok',
): boolean => {
  return mtz.tz(date, tz).subtract(amount, unit).isBefore(mtz.tz(tz))
}

/**
 *
 * @param date A date for get start of day
 * @param tz timezone for conver from server time
 * @returns A start of Day that converted with specific timezone
 */
export const startOfDay = (
  date: string | Date | undefined = undefined,
  tz = 'Asia/Bangkok',
): Date => {
  const serverTime = date ? mtz(new Date(date)) : mtz()
  const convertedTz = serverTime.clone().tz(tz)
  return convertedTz.startOf('day').toDate()
}

/**
 *
 * @param date A date for get end of day
 * @param tz timezone for conver from server time
 * @returns A end of Day that converted with specific timezone
 */
export const endOfDay = (
  date: string | Date | undefined = undefined,
  tz = 'Asia/Bangkok',
): Date => {
  const serverTime = date ? mtz(new Date(date)) : mtz()
  const convertedTz = serverTime.clone().tz(tz)
  return convertedTz.endOf('day').toDate()
}

/**
 *
 * @param date A date for get start of day
 * @param tz timezone for conver from server time
 * @returns A start of Date that converted with specific timezone
 */
export const startOfDate = (
  date: string | Date | undefined = undefined,
  tz = 'Asia/Bangkok',
): Date => {
  const serverTime = date ? mtz(new Date(date)) : mtz()
  const convertedTz = serverTime.clone().tz(tz)
  return convertedTz.toDate()
}

/**
 *
 * @param date A date for get end of day
 * @param tz timezone for conver from server time
 * @returns A end of Date that converted with specific timezone
 */
export const endOfDate = (
  date: string | Date | undefined = undefined,
  tz = 'Asia/Bangkok',
): Date => {
  const serverTime = date ? mtz(new Date(date)) : mtz()
  const convertedTz = serverTime.clone().tz(tz)
  return convertedTz.toDate()
}
