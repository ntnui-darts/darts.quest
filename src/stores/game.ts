import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStatsStore } from './stats'
import { supabase } from '@/supabase'
import {
  Game as GameData,
  Segment,
  Visit,
  getLegOfUser,
  GameController,
  GameState,
  getVisitsOfUser,
} from '@/types/game'
import { useUsersStore } from './users'
import { getGameController } from '@/games/games'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null as GameData | null,
    gameState: null as GameState | null,

    walkOn: null as string | null,
    walkOnTime: 0,

    // Don't access controller directly, use getController()
    _controller: null as GameController | null,
  }),

  actions: {
    setCurrentGame(game: GameData) {
      this.game = game
      if (this.game.legs.length == 0) throw Error()
      this.updateGameState()
    },

    getController(): GameController {
      if (!this.game) throw Error()
      if (this.game != this._controller?.game) {
        this._controller = getGameController(this.game)
      }
      return this._controller
    },

    updateGameState() {
      this.gameState = this.getController().getGameState()

      this.walkOn = null
      this.walkOnTime = 0
      if (
        this.game &&
        this.gameState.userId &&
        getVisitsOfUser(this.game, this.gameState.userId).length <= 1
      ) {
        const user = useUsersStore().getUser(this.gameState.userId)
        if (user) {
          this.walkOn = user.walkOn
          this.walkOnTime = user.walkOnTime
        }
      }

      return this.gameState
    },

    saveScore(segment: Segment) {
      if (!this.game || !this.getCurrentLeg) throw Error()
      if (!this.gameState?.userId) throw Error('No current user')
      if (this.gameState.results.includes(this.gameState.userId))
        throw Error('User has already finished')
      if (!this.getCurrentVisit) throw Error()
      const index = this.getCurrentVisit.indexOf(null)
      this.getCurrentVisit[index] = segment
      this.updateGameState()
      this.saveToLocalStorage()
    },

    undoScore() {
      if (!this.game) throw Error()
      if (!this.gameState) throw Error()
      let userId = this.gameState.userId
      let visit = this.getCurrentVisit
      if (visit?.every((s) => s == null)) {
        userId = this.gameState.prevUserId
        if (userId) {
          const leg = getLegOfUser(this.game, userId)
          if (visit.every((s) => s == null)) {
            leg.visits.pop()
          }
          visit = leg.visits.at(-1) ?? null
        }
      }
      if (!visit) return
      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null
          break
        }
      }
      this.updateGameState()
      this.saveToLocalStorage()
    },

    async saveGame() {
      if (!this.game) throw Error()
      this.game.result = this.updateGameState().results
      for (let leg of this.game.legs) {
        if (this.game.result.includes(leg.userId)) {
          leg.finish = true
          while (leg.visits.at(-1)?.every((s) => s == null)) {
            leg.visits.pop()
          }
        }
        await supabase.from('legs').insert({ ...leg, type: leg.type })
      }
      await supabase.from('games').insert({
        ...this.game,
        legs: this.game.legs.map((leg) => leg.id),
        type: this.game.type,
      })
      useStatsStore().fetchAll()
    },

    saveToLocalStorage() {
      localStorage.setItem('data', JSON.stringify(this.game))
    },
  },

  getters: {
    getCurrentVisit(): Visit | null {
      const leg = this.getCurrentLeg
      if (!leg) throw Error()
      return leg.visits.at(-1)!
    },

    getCurrentVisits(): Visit[] {
      return this.getCurrentLeg?.visits ?? []
    },

    getNumberOfThrows(): number | null {
      return this.getCurrentVisit?.findIndex((s) => s == null) ?? null
    },

    getCurrentLeg: (state) => {
      if (!state.game || !state.gameState?.userId) return null
      return getLegOfUser(state.game, state.gameState?.userId)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
