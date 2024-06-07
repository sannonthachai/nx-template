/**
 *
 * @param path image, file path that contain prefix `/storage`
 * @param df default image
 */
export const StoragePath = (urlCloudfront: string, path: string, df = ''): string => {
  const httpLink = checkHttpLink(path || df)
  const replace = replaceStorage(path || df)
  const newPath = checkMultipleSlash(replace)
  return httpLink ? path || df : addCloudfront(urlCloudfront, newPath)
}

export const checkHttpLink = (path: string): boolean => {
  const RegHttp = new RegExp('(http|https)://', 'i')
  return RegHttp.test(path)
}

export const addCloudfront = (urlCloudfront: string, path: string): string => {
  return `${urlCloudfront}/${path}`
}

export const checkMultipleSlash = (path: string): string => {
  let allocateSlash = ''
  for (const str of path) {
    if (str === '/') allocateSlash += str
    else break
  }
  return path.replace(allocateSlash, '')
}

export const replaceStorage = (path: string): string => {
  return path?.replace('/storage', '')
}

export const checkInitSlash = (path: string): string => {
  return path?.substring(0, 1) === '/' ? path : `/${path}`
}
