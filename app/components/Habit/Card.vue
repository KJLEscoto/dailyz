<script setup lang="ts">
import { Check, GripVertical } from '@lucide/vue';

</script>

<template>
  <div class="w-full h-auto bg-primary rounded-3xl overflow-hidden flex items-center justify-center relative">
    <GripVertical class="size-5 text-white" />
    <div class="w-full bg-white overflow-hidden rounded-3xl p-6">
      <section class="flex items-center gap-4">
        <section class="ring-2 ring-black/5 rounded-full size-12 flex items-center justify-center">
          <div class="ring-4 ring-primary rounded-full size-9 flex items-center justify-center bg-primary">
            <Check class="size-8 text-white" />
          </div>
        </section>
        <section class="space-y-1">
          <h2 class="text-xl font-semibold">Morning workout</h2>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full bg-red-500"></div>
            <UppercaseTitle size="md">morning</UppercaseTitle>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>