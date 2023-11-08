<template>
  <input
    type="text"
    ref="inputElement"
    v-model="searchText"
    placeholder="Search by name.."
  />

  <div class="col" style="height: 400px; overflow: auto">
    <button
      v-for="user in searchResultUsers"
      :key="user.id"
      :id="user.id"
      :disabled="props.selectedUsers.some((u) => u.id == user.id)"
      @click="select(user)"
    >
      {{ user.name }}
    </button>
    <p v-if="searchResultUsers.length == 0">No results 🤔</p>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import { User, useUsersStore } from '@/stores/users'
import { ref, computed, onMounted } from 'vue'
import PlayerOptions from './PlayerOptions.vue'

const props = defineProps<{
  selectedUsers: User[]
}>()

const emit = defineEmits<{
  select: [user: User]
}>()

const usersStore = useUsersStore()

const inputElement = ref<HTMLInputElement | null>(null)
const searchText = ref('')

const searchResultUsers = computed(() => {
  const idHistory = usersStore.getUserSelectionHistory()
  const userHistory = idHistory
    .map((id) => usersStore.getUser(id))
    .filter((user) => !!user) as User[]

  return [
    ...userHistory,
    ...usersStore.users.filter((user) => !idHistory.includes(user.id)),
  ]
    .filter((user) =>
      user.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
    .slice(0, 100)
})

onMounted(() => {
  inputElement.value?.focus()
})

const select = (user: User) => {
  useModalStore().push(
    PlayerOptions,
    { user },
    {
      cancel: () => useModalStore().pop(),
      submit: (data: { beers: number; arrows: string }) => {
        usersStore.recordUserSelection(user.id)
        emit('select', {
          ...user,
          ...data,
        })
        useModalStore().pop()
      },
    }
  )
}
</script>

<style scoped>
input {
  min-width: 250px;
}
button {
  flex: 0;
}
</style>
