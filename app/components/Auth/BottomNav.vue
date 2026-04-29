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

</script>

<template>
  <nav class="fixed bottom-4 left-0 w-full z-50">
    <div class="w-full h-fit max-w-xl mx-auto px-4 flex items-stretch gap-4">
      <section
        class="bg-white w-full border border-muted/10 rounded-3xl p-3 flex items-center justify-around shadow-xl">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all w-full duration-200 text-muted hover:text-primary"
          active-class="text-primary bg-primary/10">
          <component :is="item.icon" class="size-4 pointer-events-none" />
          <p class="text-sm">{{ item.label }}</p>
        </NuxtLink>
      </section>

      <button @click="addHabit"
        class="bg-primary flex items-center justify-center py-4 px-8 rounded-3xl cursor-pointer shadow-2xl self-stretch min-w-[20%] w-auto">
        <Plus class="size-6 text-white pointer-events-none" />
      </button>
    </div>
  </nav>

  <ModalAdd ref="modalAddRef" />
</template>