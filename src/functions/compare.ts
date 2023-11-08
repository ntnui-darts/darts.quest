export const compareCreatedAt = (
  a: { createdAt: string },
  b: { createdAt: string }
) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
