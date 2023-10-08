import { useGameStore } from '@/stores/game'
import { useUsersStore } from '@/stores/users'
import {
  Game,
  GameController,
  Visit,
  getVisitsOfUser,
  Multiplier,
  getTypeAttribute,
} from '@/types/game'

export const getRtcController = (game: Game): GameController => {
  const gameStore = useGameStore()
  return {
    game,
    getCurrentLegScore() {
      return getRtcLegScore(getVisitsOfUser(game, gameStore.userId))
    },
    getUserResultText(userId) {
      const name = useUsersStore().getUser(userId)?.name ?? 'Unknown'
      const visits = game.legs.find((leg) => leg.userId == userId)?.visits
      return `${name}, ${visits?.length} visits`
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
        multiplier: getTypeAttribute<Multiplier>(game, 'mode', 1),
        sector: getCurrentSector(getVisitsOfUser(game, gameStore.userId)),
      })
    },
    recordMiss() {
      gameStore.saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  }
}

const getCurrentSector = (visits: Visit[]) => {
  return Math.max(1, ...visits.flat().map((s) => (s ? s.sector + 1 : 0)))
}

const sumNumbers = (numbers: number[]) => {
  return numbers.reduce((prev, current) => prev + current, 0)
}

export const getRtcLegScore = (visits: Visit[]) => {
  return sumNumbers(visits.map(getVisitScore))
}

const getVisitScore = (visit: Visit) => {
  return visit.filter((seg) => seg != null && seg.sector != 0).length
}
