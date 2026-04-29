// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return // 👈 skip on SSR

  const { user, authReady } = useAuth()

  const protectedRoutes = ['/home', '/stats', '/profile']
  const guestRoutes = ['/', '/login', '/register']

  if (!authReady.value) {
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (authReady.value) {
          clearInterval(interval)
          resolve()
        }
      }, 50)

      setTimeout(() => {
        clearInterval(interval)
        resolve()
      }, 5000)
    })
  }

  if (!user.value && protectedRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  if (user.value && guestRoutes.includes(to.path)) {
    return navigateTo('/home')
  }
})