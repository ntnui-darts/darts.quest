<template>
  <div
    class="col shadow"
    style="
      gap: 0;
      background-color: rgb(43, 43, 43);
      border-radius: 0.5em;
      padding-bottom: 0.5em;
      overflow: hidden;
    "
  >
    <div class="row options" style="overflow: auto">
      <button
        v-for="(name, type) in GameTypeNames"
        :class="{ selected: type == gameType }"
        style="font-size: larger; min-width: 140px"
        :id="type"
        @click="emit('updateGameType', type)"
      >
        {{ name }}
      </button>
    </div>
    <div v-auto-animate class="col" style="padding: 1em">
      <component
        v-if="getOptionsComponent(gameType)"
        :is="getOptionsComponent(gameType)"
        :key="gameType"
        :type-attributes="typeAttributes"
        @update="emit('updateTypeAttributes', $event)"
      ></component>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GameType, GameTypeNames, getOptionsComponent } from '@/games/games'

defineProps<{ gameType: GameType; typeAttributes: string[] }>()

const emit = defineEmits<{
  updateGameType: [gameType: GameType]
  updateTypeAttributes: [typeAttributes: string[]]
}>()
</script>
