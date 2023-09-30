<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <label for="name">Name</label>
  <input
    id="name"
    :value="usersStore.getCurrentUser?.name"
    @change="updateName"
  />
  <p>{{ usersStore.getCurrentUser?.email }}</p>
  <button v-if="changed" id="save" @click="saveChanges">Save Changes</button>
  <button id="logout" @click="logout">Logout</button>
  <div>
    <h2>Stats</h2>
    <p>
      {{ statsStore.getNumberOfWins }} wins. <br />
      {{ statsStore.getNumberOfLosses }} losses. <br />
      {{ statsStore.getNumberOfSoloGames }} solo games. <br />
    </p>
    <canvas ref="chartElement"></canvas>
    <h3>History</h3>
    <div v-for="leg in statsStore.legs">
      <p>
        {{ leg.createdAt ? new Date(leg.createdAt).toDateString() : null }}
        - {{ leg.type }}, {{ leg.visits?.length }} turns - Confirmed:
        {{ leg.confirmed }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { router } from '@/router';
import { onMounted, ref } from 'vue';
import { useStatsStore } from '@/stores/stats';
import { Chart } from 'chart.js';
import { GameType } from '@/stores/game';

const authStore = useAuthStore();
const usersStore = useUsersStore();
const statsStore = useStatsStore();

const changed = ref(false);
const chartElement = ref<HTMLCanvasElement | null>(null);

const legOfType = (type: GameType, finishType: 1 | 2 | 3) => {
  return statsStore.legs.filter(
    (leg) => leg.finish && leg.type == type && leg.finishType == finishType
  );
};

onMounted(async () => {
  await statsStore.fetchLegs();
  await statsStore.fetchGames();
  if (!chartElement.value) return;

  const datasets = [];
  for (const type of ['301', '501', '701'] as const) {
    for (const [finishType, finishTypeText] of [
      [1, 'Single'],
      [2, 'Double'],
      [3, 'Triple'],
    ] as const) {
      datasets.push({
        label: `${type} ${finishTypeText}`,
        data: legOfType(type, finishType).map((leg) => ({
          x: leg.createdAt,
          y: leg.visits.length,
        })),
      });
    }
  }

  new Chart(chartElement.value, {
    type: 'line',
    data: {
      datasets,
    },
  });
});

const updateName = (e: Event) => {
  const el = e.target as HTMLInputElement;
  if (!usersStore.getCurrentUser) return;
  usersStore.getCurrentUser.name = el.value;
  changed.value = true;
};

const saveChanges = () => {
  if (!usersStore.getCurrentUser) return;
  authStore.setName(usersStore.getCurrentUser.name);
  changed.value = false;
};

const logout = async () => {
  await authStore.signOut();
  router.push({ name: 'login' });
};
</script>
