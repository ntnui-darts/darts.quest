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
import { getX01VisitScore } from '@/games/x01'

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
      if (!this.gameState?.player) throw Error('No current user')
      if (this.gameState.rank.includes(this.gameState.player))
        throw Error('User has already finished')

      const visit = this.getCurrentLeg.visits.at(-1)
      const index = visit?.indexOf(null)
      if (!visit || !index || index < 0) {
        this.getCurrentLeg.visits.push([segment, null, null])
      } else {
        visit[index] = segment
      }
      this.updateGameState()
      this.saveToLocalStorage()

      if (visit && this.game.type == 'x01' && index == 2) {
        const score = getX01VisitScore(visit)
        if (!score) speak('No score!')
        else speak(`${score}!`)
      }
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
      for (let leg of this.game.legs) {
        if (this.game.result.includes(leg.userId)) {
          leg.finish = true
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

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance()
  utterance.text = text
  utterance.voice = window.speechSynthesis.getVoices()[0]
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
