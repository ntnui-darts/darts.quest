<template>
  <div v-auto-animate class="col">
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
    <input id="password" type="password" v-model="password" />
    <label v-if="signUp" for="repeat-password">Repeat Password</label>
    <input
      v-if="signUp"
      id="repeat-password"
      type="password"
      v-model="repeatedPassword"
    />
    <p v-if="error" id="error">{{ error }}</p>
    <br />
    <button @click="submit">{{ signUp ? 'Sign Up' : 'Sign In' }}</button>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@/router';
import { useAuthStore } from '@/stores/auth';
import { onMounted, ref, watch } from 'vue';

const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const repeatedPassword = ref('');
const error = ref('');
const signUp = ref(false);

const setSignUp = (value: boolean) => {
  signUp.value = value;
  error.value = '';
};

const submit = async () => {
  error.value = '';
  if (!signUp.value) {
    if (!email.value || !password.value) {
      error.value = 'All fields are required!';
      return;
    }
  }
  if (signUp.value) {
    if (
      !name.value ||
      !email.value ||
      !password.value ||
      !repeatedPassword.value
    ) {
      error.value = 'All fields are required!';
      return;
    }
    if (signUp.value && password.value != repeatedPassword.value) {
      error.value = "Passwords don't match!";
      return;
    }
  }
  try {
    if (!authStore.auth) {
      if (signUp.value) {
        await authStore.signUp(name.value, email.value, password.value);
      } else {
        await authStore.signIn(email.value, password.value);
      }
    }
  } catch {
    error.value = 'Oh no! Something went wrong :(';
  }
};

onMounted(async () => {
  await authStore.getSession();
});

watch(
  () => authStore.auth,
  (auth) => {
    if (auth) {
      router.push({ name: 'home' });
    }
  }
);
</script>
