<template>
  <div class="col" style="justify-content: space-between; gap: 2em">
    <h3>Add Custom Player / Team</h3>

    <div class="col">
      <label for="input-name">Display Name</label>
      <input type="text" id="input-name" v-model="name" />
    </div>

    <div class="row" style="margin-bottom: 1em">
      <button @click="useModalStore().pop()">Cancel</button>
      <button :disabled="!nameValid" @click="submit">Add</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import { User, useUsersStore } from '@/stores/users'
import { nanoid } from 'nanoid'
import { computed, ref } from 'vue'

const emit = defineEmits<{
  submit: [user: User]
}>()

const name = ref('')

const nameValid = computed(() => {
  return name.value.length > 0
})

const submit = () => {
  if (!nameValid.value) return

  const user = {
    createdAt: new Date().toISOString(),
    id: `guest-${nanoid()}`,
    lastActive: new Date().toISOString(),
    name: name.value,
    visible: true,
    walkOn: null,
    walkOnEndTime: 0,
    walkOnTime: 0,
  }
  useUsersStore()._customUsers.push(user)
  emit('submit', user)
  useModalStore().pop()
}
</script>

<style scoped>
/* input {
    min-width: 250px;
  }
  button {
    flex: 0;
  } */
</style>
