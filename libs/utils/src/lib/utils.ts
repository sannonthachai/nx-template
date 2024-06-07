/**
 * !NOTE use this instead of faker.random.alphaNumeric because of faker so heavy
 * thus should use faker only in test
 *
 * @param length number of lenght
 * @param upperCase boolean true = toLocaleUpperCasem false = toLocaleLowerCase
 * @returns string random alphaNumeric
 */
export const alphaNumeric = (length: number = 6, upperCase = true): string => {
  const allChar = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let index = length; index > 0; index--)
    result += allChar[Math.round(Math.random() * (allChar.length - 1))]
  return upperCase ? result.toLocaleUpperCase() : result
}