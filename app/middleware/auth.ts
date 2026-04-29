// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { user, authReady } = useAuth()
  if (authReady.value && !user.value) return navigateTo('/') // 👈 back to landing
})