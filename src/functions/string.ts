export const stringMaxLength = (str: string | undefined, n: number) => {
  if (!str) return str
  if (str.length > n) {
    return str.slice(0, n - 2) + '..'
  }
  return str
}
