import { useOptionsStore } from '@/stores/options'

export const speak = (text: string) => {
  if (useOptionsStore().speechMuted) return

  const utterance = new SpeechSynthesisUtterance()
  utterance.text = text
  const defaultVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.localService && v.lang == 'en-GB')
  if (defaultVoice) {
    utterance.voice = defaultVoice
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
