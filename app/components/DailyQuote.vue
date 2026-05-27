<script setup lang="ts">
const { $dailyQuote } = useNuxtApp()
const { quote, author, loading, error } = $dailyQuote

const expanded = ref(false)
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col gap-3 rounded-2xl text-sm select-none">

      <!-- Loading -->
      <div v-if="loading" class="animate-pulse flex flex-col items-start gap-2">
        <div class="w-5 h-5 bg-muted/20 rounded-full"></div>
        <section class="space-y-2 w-full">
          <div class="w-full h-10 bg-muted/20 rounded-2xl"></div>
          <div class="w-1/2 h-5 bg-muted/20 rounded-2xl"></div>
        </section>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-danger">
        Failed to load quote for today.
      </div>

      <!-- Quote -->
      <template v-else-if="quote">
        <div class="flex flex-col">
          <span class="text-primary text-3xl font-serif italic select-none">"</span>
          <section class="space-y-2">
            <div class="h-full">
              <p :class="['text-white transition-all duration-300', expanded ? '' : 'line-clamp-3']">{{ quote }}</p>
              <button v-if="quote.length > 120" @click="expanded = !expanded"
                class="text-xs pointer-events-auto! text-muted/60 hover:text-muted transition-colors cursor-pointer">
                {{ expanded ? 'See less' : 'See more' }}
              </button>
            </div>
            <h4 class="text-xs text-muted font-semibold">by {{ author }}</h4>
          </section>
        </div>
      </template>

    </div>

    <template #fallback>
      <div class="flex flex-col gap-3 rounded-2xl text-sm">
        <Skeleton width="1.5rem" height="2rem" rounded="0.25rem" />
        <div class="space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="60%" height="1rem" />
        </div>
        <Skeleton width="35%" height="0.75rem" />
      </div>
    </template>
  </ClientOnly>
</template>