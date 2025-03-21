<template>
  <input
    type="text"
    ref="inputElement"
    v-model="searchText"
    placeholder="Search by name.."
  />

  <div class="col" style="height: 400px; overflow: auto">
    <button
      v-if="!disableCustom"
      style="font-style: italic"
      @click="onCustomPlayer"
    >
      + Custom player / team
    </button>

    <button
      v-for="user in searchResultUsers"
      :key="user.id"
      :id="user.id"
      :disabled="props.selectedUsers.some((u) => u.id == user.id)"
      @click="select(user)"
    >
      {{ user.name }}
      {{
        useOnlineStore().presences.find((p) => p.userId == user.id) ? '👋' : ''
      }}
    </button>
    <p v-if="searchResultUsers.length == 0">No results 🤔</p>
  </div>
</template>

<script lang="ts" setup>
import { useModalStore } from '@/stores/modal'
import { useOnlineStore } from '@/stores/online'
import { User, useUsersStore } from '@/stores/users'
import { computed, onMounted, ref } from 'vue'
import CustomPlayer from './CustomPlayer.vue'

const props = defineProps<{
  selectedUsers: User[]
  disableCustom?: boolean
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
    ...usersStore._users.filter((user) => !idHistory.includes(user.id)),
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
  emit('select', user)
}

const onCustomPlayer = () => {
  useModalStore().push(
    CustomPlayer,
    {},
    {
      submit: (user: User) => {
        select(user)
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
