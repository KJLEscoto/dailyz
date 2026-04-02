<script setup lang="ts">
const { $dailyQuote } = useNuxtApp()
const { quote, author, loading, error } = $dailyQuote
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl text-sm">

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse flex items-start gap-2">
      <div class="w-5 h-5 bg-muted/20 rounded-2xl"></div>
      <section class="space-y-2 w-full">
        <div class="w-full h-5 bg-muted/20 rounded-2xl"></div>
        <div class="w-1/2 h-5 bg-muted/20 rounded-2xl"></div>
      </section>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-danger">
      Failed to load quote. Please try again later.
    </div>

    <!-- Quote -->
    <template v-else-if="quote">
      <div class="flex gap-3">
        <span class="text-primary text-3xl font-serif italic leading-none mt-0.5 select-none">"</span>
        <p class="text-muted leading-relaxed italic">{{ quote }}</p>
      </div>
    </template>

  </div>
</template>