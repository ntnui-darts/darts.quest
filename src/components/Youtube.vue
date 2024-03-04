<template>
  <iframe
    :src="`https://www.youtube.com/embed/${parsedVideoId}?amp;start=${startTime}&end=${endTime}&autoplay=1&playsinline=1`"
    title="YouTube video player"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  ></iframe>
</template>
<script lang="ts" setup>
import { parseYoutube } from '@/components/youtube'
import { computed } from 'vue'

const props = defineProps<{
  videoId: string
  startTime: number
  endTime: number
}>()

const parsedVideoId = computed(() => parseYoutube(props.videoId))
</script>
