export type Point = { x: Date; y: number | null }
export const smoothPoints = (points: Point[]) => {
  const smoothed: Point[] = []

  for (const a of points) {
    let sumWeights = 0
    let y = 0
    for (const b of points) {
      const distance = Math.max(
        1,
        Math.pow(Math.abs(a.x.getTime() - b.x.getTime()) / 9e7, 2)
      )
      const weight = 1 / distance
      sumWeights += weight
      y += (b.y ?? 0) * weight
    }
    smoothed.push({ x: a.x, y: y / sumWeights })
  }
  return smoothed
}
