<template></template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import { onMounted, ref } from 'vue'
import Prompt from './Prompt.vue'

const installEvent = ref(undefined as any)
const pwaInstalled = ref(false)
const pwaInUse = ref(false)

const checkMediaForPwa = () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    pwaInUse.value = true
    pwaInstalled.value = true
  }
}

onMounted(() => {
  checkMediaForPwa()
  window.addEventListener('resize', checkMediaForPwa)
  window.addEventListener('appinstalled', () => {
    pwaInstalled.value = true
  })
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvent.value = e
  })

  setTimeout(() => {
    if (!pwaInstalled.value && installEvent.value) {
      showModal()
    }
  }, 3000)

  const showModal = () =>
    useModalStore().push(
      Prompt,
      {
        text: 'Do you want to install darts.quest?',
        buttons: [
          { text: 'No', onClick: () => useModalStore().pop() },
          {
            text: 'Yes',
            onClick: () => {
              installEvent.value?.prompt()
              useModalStore().pop()
            },
          },
        ],
      },
      {}
    )
})
</script>
