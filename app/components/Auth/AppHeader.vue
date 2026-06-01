<script setup lang="ts">
import { Info } from '@lucide/vue'
import { useLevelStore } from '~/stores/level'

const props = defineProps<{
  formatted: string
  completedCount: number
  habitsCount: number
  percentageCompleted: number
}>()

const { user, habitsReady } = useAuth()
const firstName = computed(() => user.value?.displayName?.split(' ')[0] ?? 'there')

const levelStore = useLevelStore()
const tier = computed(() => levelStore.currentTier)
const nextTier = computed(() => levelStore.nextTier)
const progress = computed(() => levelStore.progressPercent)
const xpInto = computed(() => levelStore.xpIntoCurrentTier)
const xpNeeded = computed(() => levelStore.xpNeededForNextTier)

const sectionBg = computed(() => `${tier.value.color}18`)
const trackBg = computed(() => `${tier.value.color}30`)
const textColor = computed(() => tier.value.color)

// only show when auth is ready AND level has been fetched
const levelReady = computed(() => habitsReady.value && !levelStore.loading)
</script>

<template>
  <header class="md:py-5 py-3">
    <section class="flex md:items-center justify-between gap-5">
      <div class="md:space-y-2 space-y-1 max-w-1/2 w-full text-nowrap">
        <UppercaseTitle size="sm">{{ formatted }}</UppercaseTitle>
        <ClientOnly>
          <PageHeader :title="`Hi, ${firstName}`" description="Let's make today a great day!" />
          <template #fallback>
            <h1 class="md:text-3xl text-2xl font-semibold text-nowrap truncate">Hi, there!</h1>
          </template>
        </ClientOnly>
      </div>
      <div class="w-full flex justify-end">
        <Image src="/images/mascot/welcome.png" alt="welcome" class="w-[80%] h-auto" />
      </div>
    </section>

    <!-- skeleton while loading -->
    <Skeleton v-if="!levelReady" height="7.5rem" rounded="14px" />

    <!-- real level card -->
    <section v-else class="rounded-3xl w-full h-auto space-y-3 transition-colors duration-500"
      :style="{ backgroundColor: sectionBg }">
      <div class="flex items-center justify-start gap-3 md:p-5 p-4">
        <section class="shrink-0">
          <Image :src="tier.badge" :alt="tier.name" class="w-20! h-auto" />
        </section>
        <section class="w-full h-auto">
          <div class="flex items-center gap-2">
            <h1 class="sm:text-xl text-base font-semibold transition-colors duration-500" :style="{ color: textColor }">
              {{ tier.name }}
            </h1>
            <Tooltip text="+15 XP per completed habits" position="top">
              <Info class="size-3.5 text-black/60" />
            </Tooltip>
          </div>
          <div class="flex items-center justify-between gap-2">
            <!-- <p class="text-sm text-black/60">Get XP by completing habits!</p> -->
            <p class="sm:text-sm text-xs text-black/60">
              <span class="font-semibold transition-colors duration-500" :style="{ color: textColor }">{{ xpInto
              }}</span>
              / {{ nextTier ? xpNeeded : 'MAX' }} XP
            </p>
          </div>
          <div class="w-full mt-2">
            <div class="w-full rounded-full h-2.5 transition-colors duration-500" :style="{ backgroundColor: trackBg }">
              <div class="h-2.5 rounded-full transition-all duration-500"
                :style="{ width: `${progress}%`, backgroundColor: textColor }" />
            </div>
          </div>
        </section>
      </div>
    </section>
  </header>
</template>