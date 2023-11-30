<template>
  <button id="back" @click="router.push({ name: 'home' })">Back</button>
  <br />

  <h2>User</h2>
  <label for="name">Display Name</label>
  <input
    id="name"
    :value="usersStore.getCurrentUser?.name"
    @change="updateName"
  />
  <p>Mail Address: {{ usersStore.getCurrentUser?.email }}</p>

  <h2>Walk On</h2>
  <label for="videoId">Walk-on Youtube URL</label>
  <input
    id="walkOn"
    :value="usersStore.getCurrentUser?.walkOn"
    @change="updateWalkOn"
  />
  <div class="row">
    <div class="col">
      <label for="videoId">Start Time (s)</label>
      <input
        id="walkOnStart"
        :value="usersStore.getCurrentUser?.walkOnTime"
        type="number"
        @change="updateWalkOnTime"
      />
    </div>
    <div class="col">
      <label for="videoId">End Time (s)</label>
      <input
        id="walkOnEnd"
        :value="usersStore.getCurrentUser?.walkOnEndTime"
        type="number"
        @change="updateWalkOnEndTime"
      />
    </div>
  </div>

  <h2>Audio</h2>
  <div id="audio" class="row">
    <button
      :class="{ selected: !optionsStore.walkOnMuted }"
      @click="optionsStore.toggleWalkOnMuted"
    >
      WalkOn: {{ optionsStore.walkOnMuted ? 'Off' : 'On' }}
    </button>
    <button
      :class="{ selected: !optionsStore.speechMuted }"
      @click="optionsStore.toggleSpeechMuted"
    >
      Speech: {{ optionsStore.speechMuted ? 'Off' : 'On' }}
    </button>
  </div>

  <h2>Password</h2>
  <button @click="router.push({ name: 'password' })" id="change-password">
    Change Password
  </button>

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
import { useOptionsStore } from '@/stores/options'
import { router } from '@/router'
import { ref } from 'vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const optionsStore = useOptionsStore()

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

const updateWalkOnEndTime = (e: Event) => {
  const el = e.target as HTMLInputElement
  if (!usersStore.getCurrentUser) return
  usersStore.getCurrentUser.walkOnEndTime = el.valueAsNumber
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
