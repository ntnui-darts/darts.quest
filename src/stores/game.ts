import X01GameInputVue from '@/components/X01GameInput.vue'
import RtcGameInputVue from '@/components/RtcGameInput.vue'
import KillerGameInputVue from '@/components/KillerGameInput.vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStatsStore } from './stats'
import { supabase } from '@/supabase'
import {
  Game,
  Segment,
  Visit,
  getLegOfUser,
  GameController,
  getTypeAttribute,
  GameState,
  getVisitsOfUser,
} from '@/types/game'
import { getX01Controller } from '@/games/x01'
import { getRtcController } from '@/games/rtc'
import { getRtcRandomController } from '@/games/rtc-random'
import { getKillerController } from '@/games/killer'
import { Component } from 'vue'
import { useUsersStore } from './users'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null as Game | null,
    walkOn: null as string | null,
    walkOnTime: 0,
    // Don't access controller directly, use getController()
    _controller: null as GameController | null,
    gameState: null as GameState | null,
  }),

  actions: {
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
    getController(): GameController {
      if (!this.game) throw Error()
      if (this.game != this._controller?.game) {
        switch (this.game.type) {
          case 'x01':
            this._controller = getX01Controller(this.game)
            break
          case 'rtc':
            if (getTypeAttribute(this.game, 'random', false)) {
              this._controller = getRtcRandomController(this.game)
            } else {
              this._controller = getRtcController(this.game)
            }
            break
          case 'killer':
            this._controller = getKillerController(this.game)
            break
        }
      }
      return this._controller
    },
    getInputComponent(): Component {
      if (!this.game) throw Error()
      switch (this.game.type) {
        case 'x01':
          return X01GameInputVue
        case 'rtc':
          return RtcGameInputVue
        case 'killer':
          return KillerGameInputVue
      }
    },
    setCurrentGame(game: Game) {
      this.game = game
      if (this.game.legs.length == 0) throw Error()
      this.updateGameState()
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
    getUserLeg(userId: string) {
      if (!this.game) throw Error()
      return this.game?.legs.find((leg) => leg.userId == userId) ?? null
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
