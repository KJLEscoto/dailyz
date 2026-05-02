<script setup lang="ts">
import { Pencil, Check, X, LoaderCircle } from '@lucide/vue'
import { sendEmailVerification, linkWithPopup, updateProfile, GoogleAuthProvider } from 'firebase/auth'

const { user } = useAuth()
const { photoURL } = useUserPhoto()

console.log(user.value)

const isEditingName = ref(false)
const editedName = ref('')
const nameLoading = ref(false)
const nameError = ref('')


const verifyLoading = ref(false)
const verifySent = ref(false)
const verifyError = ref('')

const sendVerification = async () => {
  verifyLoading.value = true
  verifyError.value = ''
  try {
    const { $firebase } = useNuxtApp()
    const firebaseUser = $firebase.auth.currentUser
    if (!firebaseUser) throw new Error('No user')

    await sendEmailVerification(firebaseUser)
    verifySent.value = true

    const interval = setInterval(async () => {
      await firebaseUser.reload()

      if (firebaseUser.emailVerified) {
        clearInterval(interval)
        verifySent.value = false

        // 👇 try to link Google account to get the photo
        try {
          const provider = new GoogleAuthProvider()
          const result = await linkWithPopup(firebaseUser, provider)

          const googlePhoto = result.user.providerData
            .find(p => p.providerId === 'google.com')?.photoURL

          // 👇 update photo but preserve the original display name
          const originalName = firebaseUser.displayName
          if (googlePhoto) {
            await updateProfile(firebaseUser, {
              photoURL: googlePhoto,
              displayName: originalName, // 👈 keep original name
            })

            // 👇 also persist in Firestore
            const { doc, updateDoc } = await import('firebase/firestore')
            const userDocRef = doc($firebase.db, 'users', firebaseUser.uid)
            await updateDoc(userDocRef, {
              photoURL: googlePhoto,
              fullName: originalName, // 👈 keep original name
            })
          }
        } catch (linkError: any) {
          // user dismissed popup or already linked — that's fine
          if (linkError.code !== 'auth/popup-closed-by-user' &&
            linkError.code !== 'auth/credential-already-in-use') {
            console.warn('Google link skipped:', linkError.code)
          }
        }

        // 👇 refresh user state
        user.value = null
        await nextTick()
        user.value = $firebase.auth.currentUser
      }
    }, 3000)

    setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
  } catch (error: any) {
    if (error.code === 'auth/too-many-requests') {
      verifyError.value = 'Too many requests. Please try again later.'
    } else {
      verifyError.value = 'Failed to send verification email.'
    }
  } finally {
    verifyLoading.value = false
  }
}

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
  <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col items-center gap-4">
    <section class="w-full rounded-2xl h-full min-h-40 overflow-hidden relative">
      <div class="relative z-10 p-4 md:w-1/2 w-3/4 pointer-events-none">
        <DailyQuote />
      </div>
      <div class="absolute inset-0">
        <NatureImage class="w-full h-full" />
      </div>
      <div class="absolute inset-0 bg-linear-to-r pointer-events-none from-black/80 via-black/50 to-transparent" />
    </section>

    <section class="flex items-center gap-4 w-full">
      <img :src="photoURL" :alt="user?.displayName ?? undefined" v-if="photoURL"
        class="sm:size-20 size-14 rounded-full object-cover shrink-0" referrerpolicy="no-referrer" />

      <div class="flex flex-col min-w-0 flex-1">
        <div v-if="isEditingName" class="flex items-center gap-2">
          <input v-model="editedName" @keyup.enter="saveName" @keyup.escape="cancelEditName"
            class="flex-1 text-base font-bold text-black/80 bg-foreground rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
            autofocus />
          <button @click="saveName" :disabled="nameLoading"
            class="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0">
            <LoaderCircle v-if="nameLoading" class="size-3.5 animate-spin" />
            <Check v-else class="size-3.5" />
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

        <p v-if="nameError && isEditingName" class="text-xs text-red-400 mt-1">{{ nameError }}</p>
        <p class="text-sm text-black/40 truncate">{{ user?.email }}</p>

        <span class="mt-1">
          <!-- Verified -->
          <p v-if="user?.emailVerified"
            class="text-xs bg-primary w-fit rounded-full text-white flex items-center gap-1 px-3 py-1 select-none">
            <!-- <Check class="size-3" /> -->
            Verified
          </p>

          <!-- Not verified -->
          <div v-else class="flex flex-col gap-2">
            <div class="w-full justify-between gap-4 flex items-center">
              <Tooltip text="Verify your email to avoid losing your habits." position="top">
                <p class="text-xs bg-muted w-fit rounded-full text-white flex items-center gap-1 px-3 py-1 select-none">
                  <!-- <X class="size-3" /> -->
                  Unverified
                </p>
              </Tooltip>
              <Button size="sm" @click="sendVerification" :disabled="verifyLoading || verifySent">
                <LoaderCircle v-if="verifyLoading" class="size-3 animate-spin" />
                <span v-else-if="verifySent">Email sent!</span>
                <span v-else>Verify Now</span>
              </Button>
            </div>

            <!-- Sent state -->
            <p v-if="verifySent" class="text-xs text-black/40">
              Check your inbox and click the verification link. This page will update automatically.
            </p>

            <p v-if="verifyError" class="text-xs text-red-400">{{ verifyError }}</p>
          </div>
        </span>
      </div>
    </section>
  </section>
</template>