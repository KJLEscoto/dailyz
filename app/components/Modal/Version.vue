<script setup lang="ts">
import { defineComponent, h } from 'vue'

const modelValue = defineModel<boolean>({ default: false })

const { data: versions, status } = await useFetch('/api/versions')

const selectedVersion = ref<string | null>(null)

const currentVersion = computed(() =>
  versions.value?.find(v => v.current)?.version_number ?? versions.value?.[0]?.version_number ?? null
)

// Auto-select current version when data loads
watch(versions, (val) => {
  if (val && !selectedVersion.value) {
    selectedVersion.value = currentVersion.value
  }
}, { immediate: true })

// Reset to current when modal closes
watch(modelValue, (val) => {
  if (!val) selectedVersion.value = currentVersion.value
})

const selectedData = computed(() =>
  versions.value?.find(v => v.version_number === selectedVersion.value)
)

// Dot icon component — green if current, transparent otherwise
const DotIcon = (isCurrent: boolean) => defineComponent({
  render: () => h('span', {
    class: [
      'size-2! rounded-full shrink-0',
      isCurrent ? 'bg-primary' : 'bg-transparent'
    ]
  })
})

const menuItems = computed(() =>
  (versions.value ?? []).map(v => ({
    label: v.version_number,
    icon: DotIcon(v.current),
    action: () => { selectedVersion.value = v.version_number },
  }))
)
</script>

<template>
  <Modal v-model="modelValue" title="What's New" description="Dailyz version history & release notes."
    primary-label="Got it" :cancel-label="undefined" @primary="modelValue = false">

    <div class="space-y-4">

      <!-- Version dropdown -->
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-black/60">Release Notes</p>
        <MainMenu :items="menuItems" :menu-width="120">
          <template #trigger>
            <div
              class="flex items-center gap-1.5 px-2 py-1 hover:bg-black/5 rounded-xl text-black/40 hover:text-black/80 cursor-pointer select-none active:scale-95 ease-in-out transition-all duration-150">
              <span class="text-xs font-semibold pointer-events-none">{{ selectedVersion ?? '—' }}</span>
              <Icon name="lucide:chevron-down" class="size-3 pointer-events-none" />
            </div>
          </template>
        </MainMenu>
      </div>

      <!-- Loading -->
      <div v-if="status === 'pending'" class="space-y-2">
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="0.875rem" width="80%" />
        <Skeleton height="0.875rem" width="70%" />
      </div>

      <!-- Features list -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">
        <div v-if="selectedData" :key="selectedData.version_number" class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-sm font-bold text-primary">{{ selectedData.version_number }}</span>
            <span v-if="selectedData.current"
              class="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Current
            </span>
          </div>
          <ul class="space-y-2">
            <li v-for="feature in selectedData.features" :key="feature.id"
              class="flex items-start gap-2 text-sm text-black/60">
              <span class="text-primary shrink-0">•</span>
              {{ feature.description }}
            </li>
          </ul>
        </div>
      </Transition>

    </div>
  </Modal>
</template>