import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStatsStore } from './stats'
import { supabase } from '@/supabase'
import {
  Game,
  Segment,
  GamePoints,
  Visit,
  getLegOfUser,
  GameController,
  getTypeAttribute,
} from '@/types/game'
import { getX01Controller } from '@/games/x01'
import { getRtcController } from '@/games/rtc'
import X01GameInputVue from '@/components/X01GameInput.vue'
import RtcGameInputVue from '@/components/RtcGameInput.vue'
import { getRtcRandomController } from '@/games/rtc-random'
import { Component } from 'vue'
import { useUsersStore } from './users'

export const useGameStore = defineStore('game', {
  state: () => ({
    userId: null as string | null,
    game: null as Game | null,
    walkOn: null as string | null,
    walkOnTime: 0,
    // Don't access controller directly, use getController()
    _controller: null as GameController | null,
  }),

  actions: {
    getController(): GameController {
      if (!this.game) throw Error()
      if (this.game != this._controller?.game) {
        switch (this.game.type) {
          case '301':
          case '501':
          case '701':
            this._controller = getX01Controller(this.game)
            break
          case 'Round the Clock':
            if (getTypeAttribute(this.game, 'random', false)) {
              this._controller = getRtcRandomController(this.game)
            } else {
              this._controller = getRtcController(this.game)
            }
            break
        }
      }
      return this._controller
    },
    getInputComponent(): Component {
      if (!this.game) throw Error()
      switch (this.game.type) {
        case '301':
        case '501':
        case '701':
          return X01GameInputVue
        case 'Round the Clock':
          return RtcGameInputVue
      }
    },
    setCurrentGame(game: Game) {
      this.game = game
      if (this.game.legs.length == 0) throw Error()
      this.userId = this.game.legs[0].userId
      this.walkOn = useUsersStore().getUser(this.userId)?.walkOn ?? null
      this.addVisitIfNecessary()
    },
    saveScore(segment: Segment) {
      if (!this.userId || !this.game || !this.getCurrentLeg) throw Error()
      if (this.game.result.includes(this.userId)) return
      this.addVisitIfNecessary()
      const visit = this.getCurrentVisit
      if (!visit) throw Error()
      const index = visit.indexOf(null)
      visit[index] = segment

      if (
        this.getController().getCurrentLegScore() == GamePoints[this.game.type]
      ) {
        this.game.result.push(this.userId)
        this.getCurrentLeg.finish = true
        this.nextUser()
      } else if (index == 2) {
        this.nextUser()
      }
      this.saveToLocalStorage()
    },
    undoScore() {
      if (!this.userId || !this.getCurrentLeg) throw Error()
      if (this.getCurrentVisit?.every((s) => s == null)) {
        this.getCurrentLeg.visits.pop()
        this.prevUser()
      }
      const visit = this.getCurrentVisit
      if (!visit) {
        this.addVisitIfNecessary()
        return
      }
      for (let i = visit.length - 1; i >= 0; i--) {
        if (visit.at(i) != null) {
          visit[i] = null
          return
        }
      }
      this.saveToLocalStorage()
    },
    addVisitIfNecessary() {
      if (!this.game) throw Error()
      const leg = this.getCurrentLeg
      if (!leg) throw Error()
      if (leg.finish) {
        return
      }
      if (leg.visits.length == 0 || leg.visits.at(-1)?.[2] != null) {
        const visit = [null, null, null] satisfies [null, null, null]
        leg.visits.push(visit)
        return visit
      }
      return leg.visits.at(-1)
    },
    nextUser() {
      if (!this.game?.legs.length) throw Error()
      if (!this.userId) {
        this.userId = this.game?.legs[0].userId ?? null
        return
      }
      if (this.game.result.length == this.game.legs.length) {
        return
      }
      const index = this.game.legs.findIndex((leg) => leg.userId == this.userId)
      if (index == -1) throw Error()
      const nextUser = this.game.legs.at(
        (index + 1) % this.game.legs.length
      )?.userId
      if (nextUser) {
        this.userId = nextUser
        if (this.getCurrentVisits.length == 0) {
          this.walkOn = useUsersStore().getUser(this.userId)?.walkOn ?? null
          this.walkOnTime =
            useUsersStore().getUser(this.userId)?.walkOnTime ?? 0
        } else {
          this.walkOn = null
          this.walkOnTime = 0
        }
        this.addVisitIfNecessary()
      }
      if (this.game.result.includes(this.userId)) {
        this.nextUser()
      }
    },
    prevUser() {
      if (!this.game?.legs.length) throw Error()
      if (!this.userId) {
        this.userId = this.game?.legs[0].userId ?? null
        return
      }
      const index = this.game.legs.findIndex((leg) => leg.userId == this.userId)
      const nextUser = this.game.legs.at(
        (index - 1) % this.game.legs.length
      )?.userId
      if (nextUser) {
        this.userId = nextUser
      }
    },
    getUserLeg(userId: string) {
      if (!this.game) throw Error()
      return this.game?.legs.find((leg) => leg.userId == userId) ?? null
    },
    async saveGame() {
      if (!this.game) throw Error()
      for (let leg of this.game.legs) {
        await supabase
          .from('legs')
          .insert({ ...leg, type: leg.type.toString() })
      }
      await supabase.from('games').insert({
        ...this.game,
        legs: this.game.legs.map((leg) => leg.id),
        type: this.game.type.toString(),
      })
      useStatsStore().fetchLegs()
      useStatsStore().fetchGames()
    },
    saveToLocalStorage() {
      localStorage.setItem('data', JSON.stringify(this.game))
    },
  },

  getters: {
    getCurrentVisit(): Visit | null {
      if (!this.userId) return null
      return this.getCurrentVisits.at(-1) ?? null
    },
    getCurrentVisits(): Visit[] {
      return this.getCurrentLeg?.visits ?? []
    },
    getNumberOfThrows(): number | null {
      return this.getCurrentVisit?.findIndex((s) => s == null) ?? null
    },
    getCurrentLeg: (state) => {
      if (!state.game || !state.userId) return null
      return getLegOfUser(state.game, state.userId)
    },
    getUserIds: (state) => {
      return state.game?.legs.map((l) => l.userId) ?? []
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
