<!-- components/Auth/BottomNav.vue -->
<script setup lang="ts">
import { Home, BarChart2, User2, Plus } from '@lucide/vue'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/profile', icon: User2, label: 'Profile' },
]

const modalAddRef = ref()
const addHabit = () => modalAddRef.value?.addHabit()

const isNavVisible = ref(true)
const lastScrollY = ref(0)

const handleScroll = () => {
  const currentScrollY = window.scrollY

  // Keep nav visible near the top
  if (currentScrollY < 4) {
    isNavVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }

  // Hide on scroll down, show on scroll up
  if (currentScrollY > lastScrollY.value) {
    isNavVisible.value = false
  } else {
    isNavVisible.value = true
  }

  lastScrollY.value = currentScrollY
}

onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="fixed bottom-4 left-0 w-full z-50 transition-transform duration-300 ease-in-out select-none"
    :class="isNavVisible ? 'translate-y-0' : 'translate-y-[130%]'">
    <div class="w-full h-fit max-w-xl mx-auto px-4 flex items-stretch gap-3">
      <section
        class="bg-white w-full border border-muted/20 rounded-3xl md:p-3 p-2 flex items-center justify-around shadow-xl">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all w-full duration-200 text-muted hover:text-primary active:scale-95 ease-in-out"
          active-class="text-primary bg-primary/10">
          <component :is="item.icon" class="size-4 pointer-events-none" />
          <p class="md:text-sm text-xs">{{ item.label }}</p>
        </NuxtLink>
      </section>

      <button @click="addHabit"
        class="bg-primary flex items-center justify-center py-4 px-8 rounded-3xl cursor-pointer shadow-2xl self-stretch min-w-[20%] w-auto border border-black/40 active:scale-95 transition-all duration-150 ease-in-out">
        <Plus class="size-6 text-white pointer-events-none shrink-0" />
      </button>
    </div>
  </nav>

  <ModalAdd ref="modalAddRef" />
</template>