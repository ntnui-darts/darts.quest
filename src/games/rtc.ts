import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Visit,
  getVisitsOfUser,
  getTypeAttribute,
} from '@/types/game'
import { getGenericController, simulateFirstToWinGame } from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { getGamePoints } from './games'

export type RtcController = GameController & { getSequence(): number[] }

export const getRtcController = (game: Game): RtcController => {
  const sequence = Array(20)
    .fill(undefined)
    .map((_, i) => i + 1)

  return {
    ...getGenericController(game),

    getGameState() {
      const sequence = this.getSequence()
      return {
        ...simulateFirstToWinGame(
          game,
          (game, visits) => getRtcLegScore(game, visits) == getGamePoints(game)
        ),

        getUserResultText(userId) {
          const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
          const visits = getVisitsOfUser(game, userId)
          return `${name}, ${visits?.length} visits`
        },

        getUserDisplayText(userId) {
          const score = getRtcLegScore(game, getVisitsOfUser(game, userId))
          return `${sequence.at(score)}`
        },
      }
    },

    getSegmentText(segment) {
      return segment ? `${segment.sector}` : '-'
    },

    getSequence() {
      return sequence
    },

    recordHit(segment) {
      const score = getRtcLegScore(
        game,
        getVisitsOfUser(game, useGameStore().gameState?.player)
      )
      const sector = this.getSequence().at(score)
      if (!sector) throw Error()
      useGameStore().saveScore({ multiplier: segment.multiplier, sector })
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
    getGamePoints(game),
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

export const rtcHitRate = (visits: Visit[]) => {
  const segments = visits.flat()
  if (!segments.length) return 0
  return sectorsHit(visits) / segments.length
}

export const sectorsHit = (visits: Visit[]) => {
  const sectors = new Set()
  visits.flat().forEach((s) => {
    if (s && s.sector > 0) {
      sectors.add(s.sector)
    }
  })
  return sectors.size
}

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
