import { speak } from '@/functions/speak'
import { getGenericController, simulateFirstToWinGame } from '@/games/generic'
import { useGameStore } from '@/stores/game'
import { toPercentage } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  GameExtended,
  GameState,
  Visit,
  getTypeAttribute,
  getVisitsOfUser,
  isSegment,
} from '@/types/game'
import { getGamePoints } from './games'

export interface RtcGameState extends GameState {
  getNextTarget(userId: string): number
}

export type RtcController = GameController<RtcGameState>

export const getRtcController = (game: GameExtended): RtcController => {
  if (!game.extension || game.extension.kind != 'rtc') {
    game.extension = {
      kind: 'rtc',
      sequence: Array(20)
        .fill(undefined)
        .map((_, i) => i + 1),
    }
  }

  return {
    ...getGenericController(game),

    getGameState() {
      if (!game.extension || game.extension.kind != 'rtc') throw Error()
      const sequence = game.extension.sequence

      const isForced = getTypeAttribute<Boolean>(game, 'forced', false)
      const winCondition = (game: Game, visits: Visit[]) => {
        if (isForced) {
          const segmentCount = visits.flat().filter((s) => s != null).length
          return segmentCount >= 20
        }
        const reachedTargetScore =
          getRtcLegScore(game, visits) == getGamePoints(game)
        return reachedTargetScore
      }
      // Only forced mode games are sorted by score
      const sortResult = isForced
        ? (a: string, b: string) => {
            return (
              getRtcLegScore(game, getVisitsOfUser(game, b)) -
              getRtcLegScore(game, getVisitsOfUser(game, a))
            )
          }
        : undefined

      return {
        ...simulateFirstToWinGame(game, winCondition, sortResult),

        getUserResultText(userId) {
          const name = useUsersStore().getName(userId)
          const visits = getVisitsOfUser(game, userId)
          const hitRate = getRtcHitRate(visits)
          return `${name}, Hit rate: ${toPercentage(hitRate)}`
        },

        getNextTarget(userId) {
          const isForced = getTypeAttribute<Boolean>(game, 'forced', false)
          const visits = getVisitsOfUser(game, userId)
          if (isForced) {
            const segmentCount = visits.flat().filter((s) => s != null).length
            return sequence.at(segmentCount) ?? -1
          }
          const score = getRtcLegScore(game, visits)
          return sequence.at(score) ?? -1
        },

        getUserDisplayText(userId) {
          return this.getNextTarget(userId).toString()
        },

        getTopRightText() {
          return ''
        },
      }
    },

    getSegmentText(segment) {
      return segment && segment != 'resigned' && typeof segment != 'number'
        ? `${segment.sector}`
        : '-'
    },

    recordHit(segment) {
      const gameState = this.getGameState()
      if (!gameState.player) throw Error()
      const sector = gameState.getNextTarget(gameState.player)
      if (!sector) throw Error()
      useGameStore().saveScore({ multiplier: segment.multiplier, sector })
    },

    speakVisit(visit) {
      const score = visit.filter((s) => isSegment(s) && s.sector > 0).length
      if (!score) speak('No score!')
      else speak(`${score}!`)
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
    visit.map((s) =>
      isSegment(s) ? (isFast ? s.multiplier : Math.min(1, s.sector)) : 0
    )
  )
}

const numbers = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
]

export const getRtcHitRate = (visits: Visit[]) => {
  const segments = visits.flat().filter((s) => s != null)
  if (!segments.length) return 0
  return sectorsHit(visits) / segments.length
}

export const sectorsHit = (visits: Visit[]) => {
  const sectors = new Set()

  visits.flat().forEach((s) => {
    if (isSegment(s) && s.sector > 0) {
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
    const segment = visitsFlat[i]
    if (!isSegment(segment)) {
      continue
    }

    if (segment.sector == 0) {
      count++
    } else {
      const index = numbers.indexOf(segment.sector)
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

export const getMaxStreak = (visits: Visit[]) => {
  let currentRtcStreak = 0
  let maxRtcStreak = 0
  visits.flat().forEach((s) => {
    if (isSegment(s) && s.sector != 0) {
      currentRtcStreak += 1
      maxRtcStreak = Math.max(maxRtcStreak, currentRtcStreak)
    } else {
      currentRtcStreak = 0
    }
  })
  return maxRtcStreak
}
