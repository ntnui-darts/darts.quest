export const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance()
  utterance.text = text
  const defaultVoice = window.speechSynthesis.getVoices().find((v) => v.default)
  if (defaultVoice) {
    utterance.voice = defaultVoice
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
