<template>
  <div v-auto-animate class="col">
    <h3>darts.quest</h3>
    <div class="row center">
      <button @click="setSignUp(false)" :class="{ selected: signUp == false }">
        Sign In
      </button>
      <button @click="setSignUp(true)" :class="{ selected: signUp == true }">
        Sign Up
      </button>
    </div>
    <label v-if="signUp" for="name">Name</label>
    <input v-if="signUp" id="name" type="name" v-model="name" />
    <label for="email">Email</label>
    <input id="email" type="email" v-model="email" />
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      v-model="password"
      @keyup.enter="
        () => {
          if (!signUp) submit()
        }
      "
    />
    <small
      v-if="!signUp"
      style="text-decoration: underline; cursor: pointer"
      @click="forgotPassword"
    >
      Forgot your password?
    </small>
    <label v-if="signUp" for="repeat-password">Repeat Password</label>
    <input
      v-if="signUp"
      id="repeat-password"
      type="password"
      v-model="repeatedPassword"
      @keyup.enter="submit"
    />
    <p v-if="error" id="error">{{ error }}</p>
    <br />
    <button :class="{ primary: checkForErrors().length == 0 }" @click="submit">
      {{ signUp ? 'Sign Up' : 'Sign In' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import Prompt from '@/components/Prompt.vue'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import { useModalStore } from '@/stores/modal'
import { ref, watch } from 'vue'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const repeatedPassword = ref('')
const error = ref('')
const signUp = ref(false)

const setSignUp = (value: boolean) => {
  signUp.value = value
  error.value = ''
}

const checkForErrors = () => {
  if (!signUp.value) {
    if (!email.value || !password.value) {
      return 'All fields are required!'
    }
  }
  if (signUp.value) {
    if (
      !name.value ||
      !email.value ||
      !password.value ||
      !repeatedPassword.value
    ) {
      return 'All fields are required!'
    }
    if (signUp.value && password.value != repeatedPassword.value) {
      return "Passwords don't match!"
    }
  }
  return ''
}

const submit = async () => {
  error.value = checkForErrors()
  try {
    if (!authStore.auth) {
      if (signUp.value) {
        await authStore.signUp(name.value, email.value, password.value)
      } else {
        await authStore.signIn(email.value, password.value)
      }
    }
  } catch {
    error.value = 'Oh no! Something went wrong :('
  }
}

const forgotPassword = async () => {
  if (!email.value) {
    error.value = 'Please include your email.'
    return
  }
  useLoadingStore().loading = true
  await authStore.forgotPassword(email.value)
  useLoadingStore().loading = false
  useModalStore().push(
    Prompt,
    {
      text: `If you have previously registered an account with the email ${email.value}, you will receive a link to change your password within a few minutes.`,
      buttons: [
        {
          text: 'Ok',
          onClick: () => useModalStore().pop(),
        },
      ],
    },
    {}
  )
}

watch(
  () => authStore.auth,
  (auth) => {
    if (auth) {
      router.push({ name: 'home' })
    }
  }
)
</script>
