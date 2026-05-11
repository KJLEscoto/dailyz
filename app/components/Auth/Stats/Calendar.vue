<script setup lang="ts">
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Habit } from '~/types/habit';

const props = defineProps<{
  habits: Habit[]
}>()

const currentMonth = ref(new Date())
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

const calendarDays = computed(() => {
  const start = startOfMonth(currentMonth.value)
  const end = endOfMonth(currentMonth.value)
  const days = eachDayOfInterval({ start, end })
  const startPadding = getDay(start)
  return [...Array(startPadding).fill(null), ...days]
})

// CalendarSection — anywhere you check completions
const completionDates = computed(() => {
  const set = new Set<string>()
  props.habits.forEach(h => h.completions?.forEach(c => set.add(c.date)))
  return set
})

// 👇 habits that existed on a given date
const habitsOnDate = (dateStr: string) =>
  props.habits.filter(h => format(new Date(h.createdAt), 'yyyy-MM-dd') <= dateStr)

const goToToday = () => {
  currentMonth.value = new Date()
  selectedDate.value = format(new Date(), 'yyyy-MM-dd')
}

const selectedDateInfo = computed(() => {
  const dateStr = selectedDate.value
  const today = format(new Date(), 'yyyy-MM-dd')
  const isFuture = dateStr > today
  const existing = habitsOnDate(dateStr)

  return {
    isFuture,
    completed: existing.filter(h => h.completions?.some(c => c.date === dateStr)),
    uncompleted: existing.filter(h => !h.completions?.some(c => c.date === dateStr)),
    total: existing.length,
  }
})

const prevMonth = () => currentMonth.value = subMonths(currentMonth.value, 1)
const nextMonth = () => currentMonth.value = addMonths(currentMonth.value, 1)
const selectDay = (date: Date) => selectedDate.value = format(date, 'yyyy-MM-dd')
const isSelected = (date: Date) => format(date, 'yyyy-MM-dd') === selectedDate.value
const hasCompletion = (date: Date) => completionDates.value.has(format(date, 'yyyy-MM-dd'))
</script>

<template>
  <ClientOnly>
    <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <p class="text-sm font-semibold text-black/60">
            {{ format(currentMonth, 'MMMM yyyy') }}
          </p>
          <!-- 👇 Today button — only show if not already on current month/day -->
          <button
            v-if="format(currentMonth, 'yyyy-MM') !== format(new Date(), 'yyyy-MM') || selectedDate !== format(new Date(), 'yyyy-MM-dd')"
            @click="goToToday"
            class="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors cursor-pointer">
            Go Today
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button @click="prevMonth"
            class="p-1.5 rounded-xl hover:bg-primary/10 text-black/40 hover:text-primary transition-colors cursor-pointer">
            <ChevronLeft class="size-4" />
          </button>
          <button @click="nextMonth"
            class="p-1.5 rounded-xl hover:bg-primary/10 text-black/40 hover:text-primary transition-colors cursor-pointer">
            <ChevronRight class="size-4" />
          </button>
        </div>
      </div>

      <!-- Day labels -->
      <div class="grid grid-cols-7 text-center">
        <span v-for="d in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="d"
          class="text-[11px] font-semibold text-black/30 py-1">
          {{ d }}
        </span>
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 gap-y-1 text-center">
        <div v-for="(day, i) in calendarDays" :key="i" class="flex items-center justify-center">
          <span v-if="!day" />
          <button v-else @click="selectDay(day)" :class="[
            'relative w-8 h-8 rounded-full text-xs font-semibold transition-all flex items-center justify-center cursor-pointer',
            isSelected(day)
              ? 'bg-primary text-white shadow-md scale-110'
              : isToday(day)
                ? 'border-2 border-primary text-primary'
                : !isSameMonth(day, currentMonth)
                  ? 'text-black/20'
                  : hasCompletion(day) && !isSelected(day)
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-text/70 hover:bg-primary/10'
          ]">
            {{ format(day, 'd') }}
            <span v-if="hasCompletion(day) && !isSelected(day)"
              class="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
          </button>
        </div>
      </div>

      <!-- Selected day habits -->
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 translate-y-1" mode="out-in">
        <div :key="selectedDate" class="bg-foreground md:p-6 p-4 rounded-2xl max-h-50 overflow-y-auto scrollbar-none">

          <!-- Future or no habits existed -->
          <div v-if="selectedDateInfo.isFuture || selectedDateInfo.total === 0" class="text-center py-4">
            <p class="text-sm font-semibold text-black/30">No habits on this day.</p>
          </div>

          <div v-else class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-primary uppercase tracking-wide">
              {{ selectedDateInfo.completed.length }}/{{ selectedDateInfo.total }} habits completed
            </p>

            <!-- Completed -->
            <div v-for="habit in selectedDateInfo.completed" :key="habit.id"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white">
              <span class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: habit.color }" />
              <span class="text-sm font-medium text-black/70">{{ habit.name }}</span>
              <span class="ml-auto text-xs" :class="habit.streak >= 3 ? 'text-orange-500' : 'text-green-500'">
                {{ habit.streak }}<span v-if="habit.streak >= 3">🔥</span><span v-else>🍀</span>
              </span>
            </div>

            <!-- Uncompleted -->
            <div v-for="habit in selectedDateInfo.uncompleted" :key="habit.id"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white opacity-40">
              <span class="size-2.5 rounded-full shrink-0 border-2" :style="{ borderColor: habit.color }" />
              <span class="text-sm font-medium text-black/50">{{ habit.name }}</span>
            </div>
          </div>

        </div>
      </Transition>
    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-4">
        <!-- header -->
        <div class="flex items-center justify-between">
          <Skeleton height="1rem" width="30%" />
          <div class="flex gap-1">
            <Skeleton width="2rem" height="2rem" rounded="0.75rem" />
            <Skeleton width="2rem" height="2rem" rounded="0.75rem" />
          </div>
        </div>

        <!-- day labels -->
        <div class="grid grid-cols-7 gap-1">
          <Skeleton v-for="i in 7" :key="i" height="1rem" rounded="0.25rem" />
        </div>

        <!-- days grid -->
        <div class="grid grid-cols-7 gap-1">
          <Skeleton v-for="i in 35" :key="i" width="2rem" height="2rem" rounded="9999px" />
        </div>

        <!-- selected day -->
        <Skeleton height="6rem" rounded="1rem" />
      </section>
    </template>
  </ClientOnly>
</template>