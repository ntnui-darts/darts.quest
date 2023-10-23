import { acceptHMRUpdate, defineStore } from 'pinia'
import { insertLegStatistics, useStatsStore } from './stats'
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
import { getGameController, getGameDisplayName } from '@/games/games'
import { getX01VisitScore } from '@/games/x01'
import { speak } from '@/functions/speak'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null as GameData | null,
    gameState: null as GameState | null,

    walkOn: null as string | null,
    walkOnTime: 0,
    walkOnEndTime: 0,

    // Don't access controller directly, use getController()
    _controller: null as GameController | null,
  }),

  actions: {
    setCurrentGame(game: GameData) {
      this.game = game
      if (this.game.legs.length == 0) throw Error()
      speak(getGameDisplayName(this.game))

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
      this.walkOnEndTime = 0
      if (
        this.game &&
        this.gameState.player &&
        getVisitsOfUser(this.game, this.gameState.player).length == 0
      ) {
        const user = useUsersStore().getUser(this.gameState.player)
        if (user) {
          this.walkOn = user.walkOn
          this.walkOnTime = user.walkOnTime
          this.walkOnEndTime = user.walkOnEndTime
        }
      }

      return this.gameState
    },

    saveScore(segment: Segment) {
      if (!this.game) throw Error()
      if (!this.getCurrentLeg) throw Error()
      if (!this.gameState) throw Error()
      const player = this.gameState?.player
      if (!player) throw Error('No current user')
      if (this.gameState.rank.includes(player))
        throw Error('User has already finished')

      const visit = this.getCurrentLeg.visits.at(-1)
      const index = visit?.indexOf(null)
      if (!visit || !index || index < 0) {
        this.getCurrentLeg.visits.push([segment, null, null])
      } else {
        visit[index] = segment
      }

      if (
        visit &&
        this.game.type == 'x01' &&
        (index == 2 || this.game.result.includes(player))
      ) {
        const score = getX01VisitScore(visit)
        if (!score) speak('No score!')
        else speak(`${score}!`)
      }

      if (
        visit &&
        this.game.type == 'rtc' &&
        (index == 2 || this.game.result.includes(player))
      ) {
        const score = visit.filter((v) => v && v.sector > 0).length
        if (!score) speak('No score!')
        else speak(`${score}!`)
      }

      this.updateGameState()
      this.saveToLocalStorage()
    },

    undoScore() {
      if (!this.game) throw Error()
      if (!this.gameState) throw Error()

      let userId = this.gameState.player
      let visit = this.getCurrentVisit
      if (!userId || !visit || visit.every((s) => s != null)) {
        userId = this.gameState.prevPlayer
      }
      if (!userId) return

      const leg = getLegOfUser(this.game, userId)
      visit = leg?.visits.at(-1) ?? null
      if (!leg || !visit) return

      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null
          break
        }
      }
      if (visit[0] == null) {
        leg.visits.pop()
      }
      this.updateGameState()
      this.saveToLocalStorage()
    },

    async saveGame() {
      if (!this.game) throw Error()
      this.game.result = this.updateGameState().rank
      await supabase.from('games').insert({
        ...this.game,
        legs: this.game.legs.map((leg) => leg.id),
        type: this.game.type,
      })
      for (let leg of this.game.legs) {
        if (this.game.result.includes(leg.userId)) {
          leg.finish = true
        }
        await supabase.from('legs').insert({ ...leg, type: leg.type })
        await insertLegStatistics(leg)
      }
      useStatsStore().fetchAll()
    },

    saveToLocalStorage() {
      localStorage.setItem('data', JSON.stringify(this.game))
    },
  },

  getters: {
    getCurrentVisit(): Visit | null {
      return this.getCurrentLeg?.visits.at(-1) ?? null
    },

    getNumberOfThrows(): number | null {
      return this.getCurrentVisit?.findIndex((s) => s == null) ?? null
    },

    getCurrentLeg: (state) => {
      if (!state.game) throw Error()
      if (!state.gameState?.player) return null
      return getLegOfUser(state.game, state.gameState?.player)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
