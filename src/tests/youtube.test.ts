import { expect, test } from 'vitest'
import { parseYoutube } from '@/components/youtube'

test('parse youtube url', () => {
  expect(
    parseYoutube(
      'https://m.youtube.com/watch?v=YnXYtfIJLu0&pp=ygULSmVnIGdpciBvcHA%3D'
    )
  ).toBe('YnXYtfIJLu0')

  expect(parseYoutube('https://m.youtube.com/watch?v=YnXYtfIJLu0')).toBe(
    'YnXYtfIJLu0'
  )

  expect(parseYoutube('wPfy_730t44')).toBe('wPfy_730t44')
})
