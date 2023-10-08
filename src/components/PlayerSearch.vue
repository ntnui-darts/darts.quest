<template>
  <input type="text" v-model="searchText" placeholder="Search by name.." />

  <button
    v-for="user in searchResultUsers"
    :key="user.id"
    :id="user.id"
    :class="{ selected: selectedUsers.find((u) => user.id == u.id) }"
    @click="emit('select', user)"
  >
    {{ user.name }}
  </button>
  <p v-if="searchResultUsers.length == 0">No results</p>
</template>

<script lang="ts" setup>
import { User, useUsersStore } from '@/stores/users'
import { ref, computed } from 'vue'

const props = defineProps<{
  selectedUsers: User[]
}>()

const emit = defineEmits<{
  select: [user: User]
}>()

const usersStore = useUsersStore()

const searchText = ref('')

const searchResultUsers = computed(() => {
  return usersStore.users
    .filter((user) => !props.selectedUsers.some((u) => u.id == user.id))
    .filter((user) =>
      user.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
    .slice(0, 3)
})
</script>
