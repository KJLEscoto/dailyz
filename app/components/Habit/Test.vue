<!-- Habit/BlockCanvas.vue -->
<script setup lang="ts">
const props = defineProps<{
  open: boolean
  blocks: {
    time: string
    count: number
    percentage: number
    label: string
    emoji: string
    color: string
    bg: string
  }[]
}>()

const containerRef = ref<HTMLDivElement>()
const blockEls = ref<HTMLElement[]>([])
const ready = ref(false)

interface Body {
  x: number; y: number
  vx: number; vy: number
  angle: number; omega: number
  size: number
  settled: boolean
  onGround: boolean
}

const bodies = ref<Body[]>([])
const dragging = ref<number | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const prevDragPos = ref({ x: 0, y: 0, t: 0 })
const gravX = ref(0)
const gravY = ref(1)

// --- super slow, smooth constants ---
const GRAVITY = 0.09
const BOUNCE = 0.08
const FRICTION = 0.78
const ANG_DAMP = 0.80
const UPRIGHT_K = 0.012   // torque pulling block upright
const UPRIGHT_D = 0.55    // damping on upright correction
const EDGE_TILT = 0.018   // how fast edge-overhang tips
const SETTLE_V = 0.08
const SETTLE_W = 0.004
const MIN_SIZE = 72
const MAX_SIZE = 160
const ITERATIONS = 6

let rafId = 0

const W = () => containerRef.value?.clientWidth ?? 340
const H = () => containerRef.value?.clientHeight ?? 320

const initBodies = () => {
  const w = W()
  bodies.value = props.blocks.map((b, i) => {
    const size = MIN_SIZE + b.percentage * (MAX_SIZE - MIN_SIZE)
    return {
      x: size / 2 + Math.random() * Math.max(0, w - size),
      y: -(size + i * (MAX_SIZE + 32)),
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0,
      angle: 0,
      omega: (Math.random() - 0.5) * 0.008,
      size,
      settled: false,
      onGround: false,
    }
  })
}

const resolveCollisions = () => {
  const bs = bodies.value
  const w = W(), h = H()
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < bs.length; i++) {
      for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i]!, b = bs[j]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const minDist = (a.size + b.size) / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist >= minDist || dist < 0.001) continue

        const overlap = minDist - dist
        const nx = dx / dist
        const ny = dy / dist

        const isDragA = dragging.value === i
        const isDragB = dragging.value === j
        const totalMass = (isDragA ? 0 : 1) + (isDragB ? 0 : 1)
        if (totalMass === 0) continue

        const pushA = isDragA ? 0 : (isDragB ? 1 : 0.5)
        const pushB = isDragB ? 0 : (isDragA ? 1 : 0.5)

        if (!isDragA) {
          a.x -= nx * overlap * pushA
          a.y -= ny * overlap * pushA
          // 👇 clamp A against walls immediately after push
          a.x = Math.min(Math.max(a.size / 2, a.x), w - a.size / 2)
          a.y = Math.min(Math.max(a.size / 2, a.y), h - a.size / 2)
        }
        if (!isDragB) {
          b.x += nx * overlap * pushB
          b.y += ny * overlap * pushB
          // 👇 clamp B against walls immediately after push
          b.x = Math.min(Math.max(b.size / 2, b.x), w - b.size / 2)
          b.y = Math.min(Math.max(b.size / 2, b.y), h - b.size / 2)
        }

        const relVx = b.vx - a.vx
        const relVy = b.vy - a.vy
        const dot = relVx * nx + relVy * ny
        if (dot > 0) continue

        const impulse = -(1 + BOUNCE) * dot / totalMass
        if (!isDragA) {
          a.vx -= impulse * nx
          a.vy -= impulse * ny
          const edgeOffset = dx / Math.max(1, a.size / 2)
          a.omega -= edgeOffset * EDGE_TILT * Math.abs(impulse)
          a.settled = false
        }
        if (!isDragB) {
          b.vx += impulse * nx
          b.vy += impulse * ny
          const edgeOffset = -dx / Math.max(1, b.size / 2)
          b.omega -= edgeOffset * EDGE_TILT * Math.abs(impulse)
          b.settled = false
        }

        if (!isDragA) a.settled = false
        if (!isDragB) b.settled = false
      }
    }
  }
}

const tick = () => {
  const w = W(), h = H()
  const gx = gravX.value * GRAVITY
  const gy = gravY.value * GRAVITY
  let anyMoving = false

  for (let i = 0; i < bodies.value.length; i++) {
    const b = bodies.value[i]!
    if (dragging.value === i || b.settled) continue

    b.vx += gx
    b.vy += gy
    b.x += b.vx
    b.y += b.vy
    b.angle += b.omega
    b.omega *= ANG_DAMP

    // upright correction torque — pulls angle back toward 0
    const uprightTorque = -b.angle * UPRIGHT_K
    b.omega += uprightTorque
    b.omega -= b.omega * (1 - UPRIGHT_D) * 0.1

    b.onGround = false

    // floor — block stands on ground by its center + half size
    if (b.y + b.size / 2 >= h) {
      b.y = h - b.size / 2
      b.vy *= -BOUNCE
      b.vx *= FRICTION
      b.omega *= FRICTION
      b.onGround = true
      if (Math.abs(b.vy) < 0.15) b.vy = 0
    }

    // ceiling
    if (b.y - b.size / 2 < -b.size * 3) {
      // allow above-screen spawning; only clamp if way out
    }

    // walls — hard clamp so blocks never go outside
    if (b.x - b.size / 2 < 0) {
      b.x = b.size / 2
      b.vx = Math.abs(b.vx) * BOUNCE
      b.omega -= 0.01
    }
    if (b.x + b.size / 2 > w) {
      b.x = w - b.size / 2
      b.vx = -Math.abs(b.vx) * BOUNCE
      b.omega += 0.01
    }
    if (b.y - b.size / 2 < 0) {
      b.y = b.size / 2
      b.vy = Math.abs(b.vy) * BOUNCE
    }

    b.settled =
      b.onGround &&
      Math.abs(b.vy) < SETTLE_V &&
      Math.abs(b.vx) < SETTLE_V &&
      Math.abs(b.omega) < SETTLE_W &&
      Math.abs(b.angle) < 0.05

    if (!b.settled) anyMoving = true
  }

  resolveCollisions()

  // write directly to DOM — bypass Vue reactivity entirely
  for (let i = 0; i < blockEls.value.length; i++) {
    const el = blockEls.value[i]
    const b = bodies.value[i]
    if (!el || !b) continue
    el.style.transform = `translate(${b.x - b.size / 2}px, ${b.y - b.size / 2}px) rotate(${b.angle}rad)`
    el.style.boxShadow = dragging.value === i
      ? '0 16px 40px rgba(0,0,0,0.16)'
      : '0 2px 12px rgba(0,0,0,0.08)'
    el.style.zIndex = dragging.value === i ? '20' : '1'
  }

  for (let i = 0; i < bodies.value.length; i++) {
    if (dragging.value === i) continue
    const b = bodies.value[i]!
    if (b.x - b.size / 2 < 0) { b.x = b.size / 2; b.vx = Math.abs(b.vx) * BOUNCE }
    if (b.x + b.size / 2 > w) { b.x = w - b.size / 2; b.vx = -Math.abs(b.vx) * BOUNCE }
    if (b.y - b.size / 2 < 0) { b.y = b.size / 2; b.vy = Math.abs(b.vy) * BOUNCE }
    if (b.y + b.size / 2 > h) { b.y = h - b.size / 2; b.vy = -Math.abs(b.vy) * BOUNCE }
  }

  if (anyMoving || dragging.value !== null) {
    rafId = requestAnimationFrame(tick)
  }
}

const tryInit = async () => {
  let attempts = 0
  while (attempts < 20) {
    await nextTick()
    const w = containerRef.value?.clientWidth ?? 0
    const h = containerRef.value?.clientHeight ?? 0
    if (w > 0 && h > 0) {
      ready.value = true
      initBodies()
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(tick)
      return
    }
    await new Promise(r => setTimeout(r, 50))
    attempts++
  }
}

watch(() => props.open, (val) => {
  cancelAnimationFrame(rafId)
  if (!val) { bodies.value = []; ready.value = false; return }
  tryInit()
})

onMounted(() => {
  if (props.open) tryInit()
})

let orientHandler: ((e: DeviceOrientationEvent) => void) | null = null

onMounted(() => {
  orientHandler = (e: DeviceOrientationEvent) => {
    if (!props.open) return
    const gamma = Math.max(-45, Math.min(45, e.gamma ?? 0))
    const beta = Math.max(-45, Math.min(45, (e.beta ?? 45) - 45))
    gravX.value = gamma / 45
    gravY.value = Math.max(0.3, beta / 45 + 1)
    bodies.value.forEach(b => { b.settled = false })
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(tick)
  }

  if (typeof DeviceOrientationEvent !== 'undefined') {
    const req = (DeviceOrientationEvent as any).requestPermission
    if (typeof req === 'function') {
      req().then((r: string) => {
        if (r === 'granted') window.addEventListener('deviceorientation', orientHandler!)
      }).catch(() => { })
    } else {
      window.addEventListener('deviceorientation', orientHandler!)
    }
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  if (orientHandler) window.removeEventListener('deviceorientation', orientHandler)
})

const getClient = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e && e.touches.length) return { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY }
  if ('clientX' in e) return { x: e.clientX, y: e.clientY }
  return { x: 0, y: 0 }
}

const startDrag = (e: MouseEvent | TouchEvent, i: number) => {
  e.preventDefault()
  cancelAnimationFrame(rafId)
  dragging.value = i
  const { x, y } = getClient(e)
  const rect = containerRef.value!.getBoundingClientRect()
  const b = bodies.value[i]!
  dragOffset.value = { x: x - rect.left - b.x, y: y - rect.top - b.y }
  prevDragPos.value = { x: x - rect.left, y: y - rect.top, t: performance.now() }
  bodies.value[i] = { ...b, vx: 0, vy: 0, omega: 0, settled: false }
  rafId = requestAnimationFrame(tick)
}

const onMove = (e: MouseEvent | TouchEvent) => {
  if (dragging.value === null || !containerRef.value) return
  const { x: cx, y: cy } = getClient(e)
  const rect = containerRef.value.getBoundingClientRect()
  const lx = cx - rect.left, ly = cy - rect.top
  const i = dragging.value
  const b = bodies.value[i]!
  const now = performance.now()
  const dt = Math.max(1, now - prevDragPos.value.t)

  bodies.value[i] = {
    ...b,
    x: Math.min(Math.max(b.size / 2, lx - dragOffset.value.x), W() - b.size / 2),
    y: Math.min(Math.max(b.size / 2, ly - dragOffset.value.y), H() - b.size / 2),
    vx: (lx - prevDragPos.value.x) / dt * 10,
    vy: (ly - prevDragPos.value.y) / dt * 10,
    omega: 0,
    settled: false,
    onGround: false,
  }

  // write drag position directly too
  const el = blockEls.value[i]
  const bNew = bodies.value[i]!
  if (el && bNew) {
    el.style.transform = `translate(${bNew.x - bNew.size / 2}px, ${bNew.y - bNew.size / 2}px) rotate(${bNew.angle}rad)`
    el.style.zIndex = '20'
  }

  prevDragPos.value = { x: lx, y: ly, t: now }
}

const endDrag = () => {
  if (dragging.value === null) return
  const i = dragging.value
  const b = bodies.value[i]!
  bodies.value[i] = {
    ...b,
    omega: (b.vx / Math.max(1, b.size)) * 0.3,
    settled: false,
  }
  dragging.value = null
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}
</script>

<template>
  <div ref="containerRef" class="relative w-full select-none touch-none rounded-2xl  !scrollbar-none"
    style="height: 320px; background: var(--color-background-secondary);" @mousemove="onMove" @mouseup="endDrag"
    @mouseleave="endDrag" @touchmove.prevent="onMove" @touchend="endDrag">
    <template v-for="(block, i) in blocks" :key="block.time">
      <div v-if="bodies[i]" :ref="el => { if (el) blockEls[i] = el as HTMLElement }"
        class="absolute flex flex-col items-center justify-center rounded-2xl" :style="{
          width: `${bodies[i]!.size}px`,
          height: `${bodies[i]!.size}px`,
          left: 0,
          top: 0,
          background: block.bg,
          cursor: 'grab',
          willChange: 'transform',
          transition: 'box-shadow 0.2s',
        }" @mousedown="startDrag($event, i)" @touchstart.prevent="startDrag($event, i)">
        <span style="font-size: 1.4rem; line-height: 1; pointer-events: none;">{{ block.emoji }}</span>
        <span class="font-bold mt-1" style="pointer-events: none; line-height: 1.1;"
          :style="{ color: block.color, fontSize: `${Math.max(13, bodies[i]!.size * 0.18)}px` }">{{ block.count
          }}</span>
        <span class="font-medium" style="pointer-events: none; line-height: 1.1; opacity: 0.72;"
          :style="{ color: block.color, fontSize: `${Math.max(10, bodies[i]!.size * 0.12)}px` }">{{ block.label
          }}</span>
      </div>
    </template>
  </div>
</template>