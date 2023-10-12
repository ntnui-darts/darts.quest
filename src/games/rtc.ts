import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Visit,
  getVisitsOfUser,
  Multiplier,
  getTypeAttribute,
  GamePoints,
} from '@/types/game'

export type RtcController = GameController & { getSequence(): number[] }

export const getRtcController = (game: Game): RtcController => {
  const gameStore = useGameStore()
  const sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)

  return {
    game,
    getSequence() {
      return sequence
    },
    getCurrentLegScore() {
      return getRtcLegScore(game, getVisitsOfUser(game, gameStore.userId))
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      return `${name}, ${visits?.length} visits`
    },
    getUserDisplayText(userId) {
      const score = getRtcLegScore(game, getVisitsOfUser(game, userId))
      return `${this.getSequence().at(score)}`
    },
    getSegmentText(segment) {
      return segment ? `${segment.sector}` : '-'
    },
    recordHit(segment) {
      gameStore.saveScore(segment)
    },
    recordMiss() {
      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

export const getCurrentSector = (game: Game, visits: Visit[]) => {
  return getRtcLegScore(game, visits) + 1
}

export const sumNumbers = (numbers: number[]) => {
  return numbers.reduce((prev, current) => prev + current, 0)
}

export const getRtcLegScore = (game: Game, visits: Visit[]) => {
  return Math.min(
    GamePoints[game.type],
    sumNumbers(visits.map((v) => getVisitScore(game, v)))
  )
}

const getVisitScore = (game: Game, visit: Visit) => {
  const isFast = getTypeAttribute<Boolean>(game, 'fast', false)
  return sumNumbers(
    visit.map((seg) =>
      seg ? (isFast ? seg.multiplier : Math.min(1, seg.sector)) : 0
    )
  )
}

const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
]
export const rtcStats = (visits: Visit[]) => {
  const visitsFlat = visits.flat()
  let count = 0
  const missCountList = Array(20).fill(0)
  const hitCountList = Array(20).fill(0)
  for (let i = 0; i < visitsFlat.length; i++) {
    const visit = visitsFlat[i]
    if (!visit) {
      continue
    }
    if (visit.sector == 0) {
      count++
    } else {
      const index = numbers.indexOf(visit.sector)
      missCountList[index] += count
      hitCountList[index] += 1
      count = 0
    }
  }
  return Array(20)
    .fill(0)
    .map((_, i) => hitCountList[i] / (hitCountList[i] + missCountList[i]))
    .map((x) => (Number.isNaN(x) ? 0 : x))
}
