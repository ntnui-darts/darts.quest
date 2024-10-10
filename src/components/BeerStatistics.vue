<template>
  <template
    v-for="[title, data] in ([
        ['Number of legs', dataBeerCount],
        ['Win rate', dataWinRate],
        ['X01 first 9 avg', dataX01First9],
        ['Skovhugger score', dataSkovhuggerScore],
        ['RTC hit rate', dataRtcHitRate],
      ] as const)"
  >
    <div class="row spaced" style="align-items: end">
      <h2>{{ title }}</h2>
      <h3>n={{ data.n }}</h3>
    </div>
    <BarChart
      :labels="data.labels"
      :datasets="[
        {
          label: title + ' with x beers',
          data: data.data,
        },
      ]"
    ></BarChart>
  </template>

  <button @click="personal = !personal" style="position: sticky; bottom: 2em">
    {{ personal ? `Show all` : `Show ${usersStore.getCurrentUser?.name}` }}
  </button>
</template>

<script lang="ts" setup>
import { RtcStat, SkovhuggerStat, useStatsStore, X01Stat } from '@/stores/stats'
import { useUsersStore } from '@/stores/users'
import { computed, ref } from 'vue'
import BarChart from './BarChart.vue'

const statsStore = useStatsStore()
const usersStore = useUsersStore()

const personal = ref(true)

const beerStats = computed(() => {
  return statsStore
    .getAll({ allowUnfinished: true })
    .filter(
      (s) =>
        s.legs.beers != null &&
        (!personal.value ||
          (usersStore.getCurrentUser &&
            s.legs.userId == usersStore.getCurrentUser.id))
    )
})

const dataBeerCount = computed(() => {
  const counts = new Map<number, number>()
  beerStats.value.forEach((s) => {
    const beers = s.legs.beers
    if (beers == null) return
    counts.set(beers, (counts.get(beers) ?? 0) + 1)
  })
  const maxBeers = Math.max(...counts.keys())
  const labels = [...Array(maxBeers + 1).keys()]
  return {
    labels,
    data: labels.map((l) => counts.get(l) ?? 0),
    n: beerStats.value.length,
  }
})

const dataWinRate = computed(() => {
  const labels = dataBeerCount.value.labels
  let n = 0
  return {
    labels,
    data: labels.map((beers) => {
      const nBeers = beerStats.value.filter((s) => s.legs.beers == beers)
      const values = nBeers.map((s) => s.winRate).filter((x) => x != null)
      n += values.length
      return values.reduce((partialSum, x) => partialSum + x, 0) / values.length
    }),
    n,
  }
})

const dataX01First9 = computed(() => {
  const x01Stats = beerStats.value.filter(
    (s) => s.legs.type == 'x01'
  ) as X01Stat[]
  const labels = dataBeerCount.value.labels
  let n = 0
  return {
    labels,
    data: labels.map((beers) => {
      const nBeers = x01Stats.filter((s) => s.legs.beers == beers)
      const values = nBeers.map((s) => s.first9Avg).filter((x) => x != null)
      n += values.length
      return values.reduce((partialSum, x) => partialSum + x, 0) / values.length
    }),
    n,
  }
})

const dataSkovhuggerScore = computed(() => {
  const skovhuggerStats = beerStats.value.filter(
    (s) => s.legs.type == 'skovhugger'
  ) as SkovhuggerStat[]
  const labels = dataBeerCount.value.labels
  let n = 0
  return {
    labels,
    data: labels.map((beers) => {
      const nBeers = skovhuggerStats.filter((s) => s.legs.beers == beers)
      const values = nBeers.map((s) => s.score).filter((x) => x != null)
      n += values.length
      return values.reduce((partialSum, x) => partialSum + x, 0) / values.length
    }),
    n,
  }
})

const dataRtcHitRate = computed(() => {
  const rtcStats = beerStats.value.filter(
    (s) => s.legs.type == 'rtc'
  ) as RtcStat[]
  const labels = dataBeerCount.value.labels
  let n = 0
  return {
    labels,
    data: labels.map((beers) => {
      const nBeers = rtcStats.filter((s) => s.legs.beers == beers)
      const values = nBeers.map((s) => s.hitRate).filter((x) => x != null)
      n += values.length
      return values.reduce((partialSum, x) => partialSum + x, 0) / values.length
    }),
    n,
  }
})
</script>
