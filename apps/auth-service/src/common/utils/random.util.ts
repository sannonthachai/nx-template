import { randomBytes } from 'crypto'

/**
 * !NOTE use this instead of faker.random.alphaNumeric because of faker so heavy
 * thus should use faker only in test
 *
 * @param length number of lenght
 * @returns string random alphaNumeric
 */
export const alphaNumeric = (length: number): string => {
  const allChar = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let index = length; index > 0; index--)
    result += allChar[Math.round(Math.random() * (allChar.length - 1))]
  return result
}

export const randomHex = (length = 10, upper = true): string => {
  const codeHex = randomBytes(length / 2).toString('hex')
  return upper ? codeHex.toUpperCase() : codeHex
}
