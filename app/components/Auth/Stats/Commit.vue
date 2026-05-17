<script setup lang="ts">
import { format, eachDayOfInterval, startOfDay, startOfYear, endOfYear, getYear, getMonth } from 'date-fns'
import { CalendarFold } from '@lucide/vue'
import type { MenuItem } from '~/components/MainMenu.vue'

const habitStore = useHabitStore()
const habits = computed(() => habitStore.habits)

const today = startOfDay(new Date())

const getDate = (c: any): string => typeof c === 'string' ? c : c?.date ?? ''

const activeDays = computed(() =>
  days.value.filter(d => !d.isFuture && d.completed > 0).length
)

// --- Year filtering ---
const availableYears = computed(() => {
  const currentYear = getYear(today)
  if (!habits.value.length) return [currentYear]
  const yearsSet = new Set<number>([currentYear])
  habits.value.forEach(h => {
    yearsSet.add(getYear(new Date(h.createdAt)))
    h.completions?.forEach(c => {
      const d = new Date(getDate(c))
      if (!isNaN(d.getTime())) yearsSet.add(getYear(d))
    })
  })
  return [...yearsSet].sort((a, b) => b - a)
})

const selectedYear = ref(getYear(today))

watchEffect(() => {
  if (!availableYears.value.includes(selectedYear.value)) {
    selectedYear.value = availableYears.value[0] ?? getYear(today)
  }
})

const yearMenuItems = computed(() =>
  availableYears.value.map(year => ({
    label: String(year),
    action: () => { selectedYear.value = year },
  })) as MenuItem[]
)

const rangeStart = computed(() => startOfYear(new Date(selectedYear.value, 0, 1)))
const rangeEnd = computed(() => endOfYear(new Date(selectedYear.value, 0, 1)))

// --- Grid computation ---
const days = computed(() => {
  return eachDayOfInterval({ start: rangeStart.value, end: rangeEnd.value }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isFuture = date > today
    if (isFuture) {
      return { dateStr, completed: 0, total: 0, ratio: -2, dayOfWeek: date.getDay(), isFuture: true }
    }
    const existingHabits = habits.value.filter(h => {
      const created = format(new Date(h.createdAt), 'yyyy-MM-dd')
      return created <= dateStr
    })
    const completed = existingHabits.filter(h =>
      h.completions?.some(c => getDate(c) === dateStr)
    ).length
    const total = existingHabits.length
    const ratio = total === 0 ? 0 : completed / total
    return { dateStr, completed, total, ratio, dayOfWeek: date.getDay(), isFuture: false }
  })
})

const weeks = computed(() => {
  const chunks: typeof days.value[] = []
  const allDays = [...days.value]
  const firstDay = new Date(allDays[0]!.dateStr)
  const padding = firstDay.getDay()
  for (let i = 0; i < padding; i++) {
    allDays.unshift({ dateStr: '', completed: 0, total: 0, ratio: -1, dayOfWeek: -1, isFuture: false })
  }
  for (let i = 0; i < allDays.length; i += 7) {
    chunks.push(allDays.slice(i, i + 7))
  }
  return chunks
})

const months = computed(() => {
  const labels: { label: string; col: number }[] = []
  let lastMonth = ''
  weeks.value.forEach((week, colIndex) => {
    const firstReal = week.find(d => d.dateStr)
    if (!firstReal) return
    const month = format(new Date(firstReal.dateStr), 'MMM')
    if (month !== lastMonth) {
      labels.push({ label: month, col: colIndex })
      lastMonth = month
    }
  })
  return labels
})

const getColor = (ratio: number, isFuture: boolean) => {
  if (isFuture) return 'bg-black/[0.03]'
  if (ratio === 0) return 'bg-black/5'
  if (ratio <= 0.25) return 'bg-primary/20'
  if (ratio <= 0.50) return 'bg-primary/40'
  if (ratio <= 0.75) return 'bg-primary/70'
  return 'bg-primary'
}

const ROW_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' }

// --- Auto-scroll to current month ---
const scrollRef = ref<HTMLDivElement>()

// Find the week column index where the current month starts
const currentMonthCol = computed(() => {
  const isCurrentYear = selectedYear.value === getYear(today)
  // For other years default to the start (Jan); for current year find current month
  const targetMonth = isCurrentYear ? getMonth(today) : 0  // 0 = January
  const targetMonthStr = format(new Date(selectedYear.value, targetMonth, 1), 'MMM')
  return months.value.find(m => m.label === targetMonthStr)?.col ?? 0
})

const scrollToCurrentMonth = async () => {
  await nextTick()
  const el = scrollRef.value
  if (!el) return

  const CELL = 12   // cell width px
  const GAP = 3     // gap between cells px
  const colWidth = CELL + GAP

  const colIndex = currentMonthCol.value
  const colLeft = colIndex * colWidth

  // Center the target month in the visible scroll area
  const visibleWidth = el.clientWidth
  const labelColWidth = 32  // approximate width of sticky day-label column
  const scrollTarget = colLeft - (visibleWidth - labelColWidth) / 2 + colWidth * 2

  el.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'instant' })
}

// Scroll on mount and whenever the year changes
onMounted(scrollToCurrentMonth)
watch(selectedYear, scrollToCurrentMonth)
</script>

<template>
  <ClientOnly>
    <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-4 h-full w-full">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-black/60">Daily Commits</p>
        <MainMenu :items="yearMenuItems" :menu-width="120">
          <template #trigger>
            <div
              class="flex items-center gap-1.5 px-2 py-1 hover:bg-black/5 rounded-xl text-black/40 hover:text-black/80 cursor-pointer select-none active:scale-95 ease-in-out transition-all duration-150">
              <span class="text-xs font-semibold pointer-events-none">{{ selectedYear }}</span>
              <CalendarFold class="size-3 pointer-events-none" />
            </div>
          </template>
        </MainMenu>
      </div>

      <!-- ✅ scrollRef added here -->
      <div ref="scrollRef" class="overflow-x-auto scrollbar-none">
        <div class="min-w-max flex gap-2 relative">

          <!-- Sticky day-of-week labels -->
          <div class="flex flex-col sticky left-0 z-10 bg-white" style="gap: 3px; padding-top: 18px">
            <template v-for="row in 7" :key="row">
              <div class="flex items-center justify-end" style="height: 12px">
                <span v-if="ROW_LABELS[row - 1]"
                  class="text-[10px] text-black/30 font-semibold leading-none pr-1 whitespace-nowrap">
                  {{ ROW_LABELS[row - 1] }}
                </span>
              </div>
            </template>
          </div>

          <!-- Main grid -->
          <div class="flex flex-col">
            <!-- Month labels -->
            <div class="flex mb-1" style="gap: 3px">
              <template v-for="(week, i) in weeks" :key="i">
                <div :class="[
                  'text-[10px] font-semibold',
                  months.find(m => m.col === i)?.label === format(new Date(selectedYear, getMonth(today), 1), 'MMM') && selectedYear === getYear(today)
                    ? 'text-primary'
                    : 'text-black/30'
                ]" style="min-width: 12px; width: 12px">
                  {{months.find(m => m.col === i)?.label ?? ''}}
                </div>
              </template>
            </div>

            <!-- Week columns -->
            <div class="flex" style="gap: 3px">
              <template v-for="(week, wi) in weeks" :key="wi">
                <div class="flex flex-col" style="gap: 3px">
                  <template v-for="(day, di) in week" :key="di">
                    <Tooltip v-if="day.dateStr && !day.isFuture"
                      :text="day.total === 0
                        ? `0 habits on ${format(new Date(day.dateStr), 'MMM d')}`
                        : `${day.completed}/${day.total} habit${day.total !== 1 ? 's' : ''} on ${format(new Date(day.dateStr), 'MMM d')}`" position="top">
                      <div
                        :class="['rounded-sm transition-all duration-200 cursor-default', getColor(day.ratio, false)]"
                        style="width: 12px; height: 12px" />
                    </Tooltip>
                    <Tooltip v-else-if="day.dateStr && day.isFuture"
                      :text="`0 habits on ${format(new Date(day.dateStr), 'MMM d')}`" position="top">
                      <div :class="['rounded-sm cursor-default transition-all duration-200', getColor(day.ratio, true)]"
                        style="width: 12px; height: 12px" />
                    </Tooltip>
                    <div v-else style="width: 12px; height: 12px" />
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-between w-full">
        <section>
          <p class="text-xs text-black/40">
            <span class="font-semibold text-black/60">{{ activeDays }}</span>
            day{{ activeDays !== 1 ? 's' : '' }} active
          </p>
        </section>
        <section class="flex items-center gap-1 justify-end">
          <span class="text-xs text-black/40">Less</span>
          <div class="bg-black/5 rounded-sm" style="width: 12px; height: 12px" />
          <div class="bg-primary/20 rounded-sm" style="width: 12px; height: 12px" />
          <div class="bg-primary/40 rounded-sm" style="width: 12px; height: 12px" />
          <div class="bg-primary/70 rounded-sm" style="width: 12px; height: 12px" />
          <div class="bg-primary rounded-sm" style="width: 12px; height: 12px" />
          <span class="text-xs text-black/40">More</span>
        </section>
      </div>
    </section>

    <template #fallback>
      <section class="bg-white rounded-3xl md:p-6 p-4 flex flex-col gap-4 h-full w-full overflow-x-hidden">
        <Skeleton height="1rem" width="30%" />
        <div class="flex gap-1">
          <div v-for="w in 53" :key="w" class="flex flex-col gap-1">
            <Skeleton v-for="d in 7" :key="d" width="12px" height="12px" rounded="0.125rem" />
          </div>
        </div>
      </section>
    </template>
  </ClientOnly>
</template>