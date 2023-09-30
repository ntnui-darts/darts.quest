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
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { router } from '@/router';
import { ref } from 'vue';

const authStore = useAuthStore();
const usersStore = useUsersStore();

const changed = ref(false);
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
