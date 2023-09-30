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
    <div v-for="leg in statsStore.legs">
      <p>
        {{ leg.createdAt ? new Date(leg.createdAt).toDateString() : null }}
        - {{ leg.type }}, {{ leg.visits.length }} turns - Confirmed:
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

const authStore = useAuthStore();
const usersStore = useUsersStore();
const statsStore = useStatsStore();

const changed = ref(false);

onMounted(() => {
  statsStore.getLegs();
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
