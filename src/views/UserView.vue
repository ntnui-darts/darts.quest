<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <br />
  <label for="name">Display Name</label>
  <input
    id="name"
    :value="usersStore.getCurrentUser?.name"
    @change="updateName"
  />
  <p>Mail Address: {{ usersStore.getCurrentUser?.email }}</p>
  <label for="videoId">Walk-on Youtube Id</label>
  <input
    id="walkOn"
    :value="usersStore.getCurrentUser?.walkOn"
    @change="updateWalkOn"
  />
  <label for="videoId">Walk-on Video Start Time</label>
  <input
    id="walkOnStart"
    :value="usersStore.getCurrentUser?.walkOnTime"
    type="number"
    @change="updateWalkOnTime"
  />
  <button @click="router.push({ name: 'password' })">Change Password</button>
  <div class="row">
    <button v-if="changed" id="discard" @click="discardChanges">
      Discard Changes
    </button>
    <button v-if="changed" id="save" class="primary" @click="saveChanges">
      Save Changes
    </button>
  </div>
  <br />
  <br />
  <button id="logout" @click="logout">Logout</button>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { router } from '@/router'
import { ref } from 'vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const changed = ref(false)
const updateName = (e: Event) => {
  const el = e.target as HTMLInputElement
  if (!usersStore.getCurrentUser) return
  usersStore.getCurrentUser.name = el.value
  changed.value = true
}
const updateWalkOn = (e: Event) => {
  const el = e.target as HTMLInputElement
  if (!usersStore.getCurrentUser) return
  usersStore.getCurrentUser.walkOn = el.value
  changed.value = true
}

const updateWalkOnTime = (e: Event) => {
  const el = e.target as HTMLInputElement
  if (!usersStore.getCurrentUser) return
  usersStore.getCurrentUser.walkOnTime = el.valueAsNumber
  changed.value = true
}

const saveChanges = () => {
  if (!usersStore.getCurrentUser) return
  authStore.setUserParams(usersStore.getCurrentUser)
  changed.value = false
}

const discardChanges = async () => {
  if (!usersStore.getCurrentUser) return
  await useUsersStore().fetchUsers()
  changed.value = false
}

const logout = async () => {
  await authStore.signOut()
  router.push({ name: 'login' })
}
</script>
