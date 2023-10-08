import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Visit,
  getVisitsOfUser,
  Multiplier,
} from '@/types/game'

export const getRtcController = (
  game: Game,
  userId: string
): GameController => {
  const gameStore = useGameStore()
  return {
    getCurrentLegScore() {
      return getLegScore(getVisitsOfUser(game, userId))
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      return `${name}, ${visits} visits`
    },
    getUserDisplayText(userId) {
      const currentSector = getCurrentSector(getVisitsOfUser(game, userId))
      return `${currentSector}`
    },
    getSegmentText(segment) {
      return segment ? `${segment.sector}` : '-'
    },
    recordHit() {
      gameStore.saveScore({
        multiplier: game.finishType,
        sector: getCurrentSector(getVisitsOfUser(game, userId)),
      })
    },
    recordMiss() {
      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

export const getCurrentSector = (visits: Visit[]) => {
  return Math.max(1, ...visits.flat().map((s) => (s ? s.sector + 1 : 0)))
}

const sumNumbers = (numbers: number[]) => {
  return numbers.reduce((prev, current) => prev + current, 0)
}

export const getLegScore = (visits: Visit[]) => {
  return sumNumbers(visits.map(getVisitScore))
}

const getVisitScore = (visit: Visit) => {
  return visit.filter((seg) => seg != null && seg.sector != 0).length
}
