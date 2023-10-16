export const parseYoutube = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) {
    const [beforeAnd, _] = url.split('&')
    const [__, videoId] = beforeAnd.split('?v=')
    return videoId
  }
  return url
}
