<!-- components/Auth/AppHeader.vue -->
<script setup lang="ts">
import { Info } from '@lucide/vue';

const props = defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
  signOut: () => Promise<void>
}>()

const { user } = useAuth() // 👈 directly here too
const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')
</script>

<template>
  <header class="md:py-5 py-3">
    <section class="flex items-center justify-between gap-5">
      <div class="md:space-y-2 space-y-1 max-w-1/2 w-full">
        <UppercaseTitle size="sm">{{ formatted }}</UppercaseTitle>
        <ClientOnly>
          <PageHeader :title="`Hi, ${firstName}!`" description="Let's make today a great day!" />
          <template #fallback>
            <h1 class="md:text-3xl text-2xl font-semibold text-nowrap truncate">
              Hi, there!
            </h1>
          </template>
        </ClientOnly>
      </div>
      <div class="w-full place-items-end">
        <Image src="/images/mascot/welcome.png" alt="welcome" class="w-[80%] h-auto" />
      </div>
    </section>

    <section class="bg-green-500/10 rounded-3xl w-full h-auto space-y-3">
      <div class="flex items-center justify-start gap-3 p-5">
        <section class="shrink-0">
          <Image src="/svg/badges/Forest.svg" alt="badge" class="w-20! h-auto" />
        </section>
        <section class="w-full h-auto">
          <div class="flex items-center gap-2">
            <h1 class="sm:text-xl text-base font-semibold text-green-800">Forest</h1>
            <Info class="size-3.5 text-black/60" />
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm text-black/60">
              Get XP by completing habits!
            </p>
            <p class="sm:text-sm text-xs text-black/60"><span class="text-green-800 font-semibold">650</span> / 900 XP
            </p>
          </div>
          <div class="w-full mt-2">
            <!-- Progress bar -->
            <div class="w-full bg-green-500/20 rounded-full h-2.5">
              <div class="bg-green-800 h-2.5 rounded-full" style="width: 72%"></div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </header>
</template>