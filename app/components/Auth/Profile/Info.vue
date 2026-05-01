<!-- components/Auth/Profile/Info.vue -->
<script setup lang="ts">
import { Pencil, Check, X } from '@lucide/vue'
import { updateProfile } from 'firebase/auth'

const { user } = useAuth()

const isEditingName = ref(false)
const editedName = ref('')
const nameLoading = ref(false)
const nameError = ref('')

const startEditName = () => {
  editedName.value = user.value?.displayName ?? ''
  isEditingName.value = true
  nameError.value = ''
}

const cancelEditName = () => {
  isEditingName.value = false
  nameError.value = ''
}

const saveName = async () => {
  if (!editedName.value.trim()) {
    nameError.value = 'Name cannot be empty.'
    return
  }
  nameLoading.value = true
  try {
    const { $firebase } = useNuxtApp()
    const firebaseUser = $firebase.auth.currentUser
    if (!firebaseUser) throw new Error('No user')

    const trimmedName = editedName.value.trim()
    await updateProfile(firebaseUser, { displayName: trimmedName })

    const { doc, updateDoc } = await import('firebase/firestore')
    const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
    await updateDoc(userDocRef, { fullName: trimmedName })

    user.value = null
    await nextTick()
    user.value = $firebase.auth.currentUser
    isEditingName.value = false
    nameError.value = ''
  } catch {
    nameError.value = 'Failed to update name.'
  } finally {
    nameLoading.value = false
  }
}
</script>

<template>
  <section class="bg-white rounded-3xl p-6 flex flex-col items-center gap-4">
    <section class="w-full rounded-2xl h-full min-h-40 overflow-hidden relative">
      <div class="relative z-10 p-4 w-1/2 pointer-events-none">
        <DailyQuote />
      </div>
      <div class="absolute inset-0">
        <NatureImage class="w-full h-full" />
      </div>
      <div class="absolute inset-0 bg-linear-to-r pointer-events-none from-black/80 via-black/50 to-transparent" />
    </section>

    <section class="flex items-center gap-4 w-full">
      <img :src="user?.photoURL ?? '/images/default_user.png'" :alt="user?.displayName ?? undefined"
        class="size-16 rounded-full object-cover shrink-0" referrerpolicy="no-referrer" />

      <div class="flex flex-col gap-1 min-w-0 flex-1">
        <div v-if="isEditingName" class="flex items-center gap-2">
          <input v-model="editedName" @keyup.enter="saveName" @keyup.escape="cancelEditName"
            class="flex-1 text-base font-bold text-black/80 bg-foreground rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
            autofocus />
          <button @click="saveName" :disabled="nameLoading"
            class="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0">
            <Check class="size-3.5" />
          </button>
          <button @click="cancelEditName"
            class="p-1.5 rounded-xl hover:bg-black/5 text-black/40 transition-colors shrink-0">
            <X class="size-3.5" />
          </button>
        </div>

        <div v-else class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-black/80 truncate">{{ user?.displayName ?? 'User' }}</h2>
          <button @click="startEditName"
            class="p-1 rounded-lg hover:bg-black/5 text-black/30 hover:text-black/60 transition-colors shrink-0 cursor-pointer">
            <Pencil class="size-3.5" />
          </button>
        </div>

        <p v-if="nameError && isEditingName" class="text-xs text-red-400">{{ nameError }}</p>
        <p class="text-sm text-black/40 truncate">{{ user?.email }}</p>
      </div>
    </section>
  </section>
</template>