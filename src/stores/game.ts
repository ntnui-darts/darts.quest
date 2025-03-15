import { speak } from '@/functions/speak'
import { getGameController, getGameDisplayName } from '@/games/games'
import { supabase } from '@/supabase'
import {
  GameController,
  GameExtended,
  GameState,
  Resigned,
  Segment,
  Visit,
  getLegOfUser,
  getVisitsOfUser,
} from '@/types/game'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useEloStore } from './elo'
import { useOnlineStore } from './online'
import { upsertLegStatistics, useStatsStore } from './stats'
import { useUsersStore } from './users'

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null as GameExtended | null,
    gameState: null as GameState | null,

    walkOn: null as string | null,
    walkOnTime: 0,
    walkOnEndTime: 0,

    // Don't access controller directly, use getController()
    _controller: null as GameController<GameState> | null,
  }),

  actions: {
    setCurrentGame(game: GameExtended) {
      this.game = game
      if (this.game.legs.length == 0) throw Error()
      speak(getGameDisplayName(this.game))

      this.refreshGameState()
    },

    getController(): GameController<GameState> {
      if (!this.game) throw Error()
      if (this.game != this._controller?.game) {
        this._controller = getGameController(this.game)
      }
      return this._controller
    },

    refreshGameState() {
      this.gameState = this.getController().getGameState()
      if (this.game) {
        this.game.result = this.gameState.result
      }
      useOnlineStore().sendGame()
      this.tryPlayWalkOn()
      return this.gameState
    },

    tryPlayWalkOn() {
      this.walkOn = null
      this.walkOnTime = 0
      this.walkOnEndTime = 0
      if (
        this.game &&
        this.gameState?.player &&
        getVisitsOfUser(this.game, this.gameState.player).length == 0
      ) {
        const user = useUsersStore().getUser(this.gameState.player)
        if (user) {
          this.walkOn = user.walkOn
          this.walkOnTime = user.walkOnTime
          this.walkOnEndTime = user.walkOnEndTime
        }
      }
    },

    saveScore(segment: Segment | Resigned) {
      if (!this.game) throw Error()
      if (!this.getCurrentLeg) throw Error()
      if (!this.gameState) throw Error()
      const player = this.gameState?.player
      if (!player) throw Error('No current user')
      if (this.gameState.result.includes(player))
        throw Error('User has already finished')

      let visit = this.getCurrentLeg.visits.at(-1)
      const index = visit?.indexOf(null)
      if (!visit || !index || index < 0) {
        visit = [segment, null, null]
        this.getCurrentLeg.visits.push(visit)
      } else {
        visit[index] = segment
      }

      if (
        visit &&
        (!visit.includes(null) || this.game.result.includes(player))
      ) {
        this.getController().speakVisit(visit, this.getCurrentLeg)
      }

      this.refreshGameState()
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
      this.refreshGameState()
      this.saveToLocalStorage()
    },

    async saveGame() {
      if (!this.game || !this.gameState) return false
      this.refreshGameState()

      await supabase.from('games').insert({
        ...this.game,
        legs: this.game.legs.map((leg) => leg.id),
      })
      const eloDeltas = await useEloStore().updateEloFromGame(this.game, true)

      for (let leg of this.game.legs) {
        if (this.game.result.includes(leg.userId)) {
          leg.finish = true
        }
        await supabase.from('legs').insert(leg)
        await upsertLegStatistics(
          leg,
          this.game,
          this.gameState,
          eloDeltas.find((e) => e.userId == leg.userId)?.eloDelta ?? 0
        )
      }

      useStatsStore().fetchAll()

      return true
    },

    saveToLocalStorage() {
      localStorage.setItem('game', JSON.stringify(this.game))
    },
  },

  getters: {
    getCurrentVisit(): Visit | null {
      return this.getCurrentLeg?.visits.at(-1) ?? null
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
