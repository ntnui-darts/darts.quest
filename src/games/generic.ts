import { useGameStore } from '@/stores/game'
import {
  Game,
  GameController,
  Multiplier,
  Visit,
  getVisitsOfUser,
  multiplierToString,
  Segment,
} from '@/types/game'

export const getGenericController = (game: Game) => {
  return {
    game,
    recordHit(segment) {
      if (!segment) return
      useGameStore().saveScore(segment)
    },
    recordMiss() {
      useGameStore().saveScore({ multiplier: Multiplier.None, sector: 0 })
    },
  } satisfies Partial<GameController>
}

export const getSegmentText = (segment?: Segment | null) => {
  if (!segment) return '-'
  if (!segment.multiplier || segment.multiplier == 1)
    return segment.sector.toString()
  return `${multiplierToString(segment.multiplier)} x ${segment.sector}`
}

export const getResultsOfFirstToWinGame = (
  game: Game,
  winCondition: (game: Game, visits: Visit[]) => boolean
) => {
  const results: string[] = []
  const playersLeft = [...game.players]
  let visitIndex = 0
  let userId: string | null = null
  let prevUserId: string | null = null

  while (playersLeft.length) {
    for (let i = 0; i < playersLeft.length; i++) {
      const player = playersLeft[i]
      const allVisits = getVisitsOfUser(game, player)
      const visits = allVisits.slice(0, visitIndex)

      if (winCondition(game, visits)) {
        results.push(player)
        playersLeft.splice(i, 1)
        i -= 1
        if (!userId) {
          prevUserId = player
        }
        continue
      }

      if (!userId && visits.at(-1)?.includes(null)) {
        userId = player
      }
      if (!userId) {
        prevUserId = player
      }

      if (visits.length == allVisits.length) {
        playersLeft.splice(i, 1)
        i -= 1
        continue
      }
    }

    visitIndex += 1
  }
  return {
    results,
    userId,
    prevUserId,
    playersLeft: game.players.filter((p) => !results.includes(p)),
  }
}
