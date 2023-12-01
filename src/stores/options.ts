import { acceptHMRUpdate, defineStore } from 'pinia'

const getWalkOnMuted = () => {
  const json = localStorage.getItem('walkOnMuted')
  return json ? (JSON.parse(json) as boolean) : false
}

const getSpeechMuted = () => {
  const json = localStorage.getItem('speechMuted')
  return json ? (JSON.parse(json) as boolean) : false
}

export const useOptionsStore = defineStore('options', {
  state: () => ({
    walkOnMuted: getWalkOnMuted(),
    speechMuted: getSpeechMuted(),
  }),

  actions: {
    toggleWalkOnMuted() {
      this.walkOnMuted = !this.walkOnMuted
      localStorage.setItem('walkOnMuted', this.walkOnMuted.toString())
    },

    toggleSpeechMuted() {
      this.speechMuted = !this.speechMuted
      localStorage.setItem('speechMuted', this.speechMuted.toString())
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOptionsStore, import.meta.hot))
}
