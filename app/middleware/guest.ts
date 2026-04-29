// middleware/guest.ts
export default defineNuxtRouteMiddleware(() => {
  const { user, authReady } = useAuth()
  if (authReady.value && user.value) return navigateTo('/home')
})