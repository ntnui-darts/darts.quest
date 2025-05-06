<template>
  <button id="back" @click="router.push({ name: 'user' })">Back</button>
  <label for="password">New Password</label>
  <input id="password" type="password" v-model="password" />
  <label for="repeat-password">Repeat New Password</label>
  <input
    id="repeat-password"
    type="password"
    v-model="repeatedPassword"
    @keyup.enter="submit"
  />
  <p v-if="error" id="error">{{ error }}</p>
  <br />
  <button :class="{ primary: checkForErrors().length == 0 }" @click="submit">
    Update Password
  </button>
</template>

<script lang="ts" setup>
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const authStore = useAuthStore()
const error = ref('')
const password = ref('')
const repeatedPassword = ref('')

const checkForErrors = () => {
  if (!password.value || !repeatedPassword.value) {
    return 'All fields are required!'
  }
  if (password.value != repeatedPassword.value) {
    return "Passwords don't match!"
  }
  return ''
}

const submit = async () => {
  error.value = checkForErrors()
  try {
    await authStore.updatePassword(password.value)
    router.push({ name: 'home' })
  } catch {
    error.value = 'Oh no! Something went wrong :('
  }
}
</script>
