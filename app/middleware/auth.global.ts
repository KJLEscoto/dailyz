export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { user, authReady, processingRedirect } = useAuth()

  // ✅ Google redirect being processed — stand down completely
  if (processingRedirect.value) return

  const protectedRoutes = ['/home', '/stats', '/profile']
  const guestRoutes = ['/', '/login', '/register']

  if (!authReady.value) {
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (authReady.value) { clearInterval(interval); resolve() }
      }, 50)
      setTimeout(() => { clearInterval(interval); resolve() }, 5000)
    })
  }

  if (processingRedirect.value) return

  if (!user.value && protectedRoutes.includes(to.path)) return navigateTo('/')
  if (user.value && guestRoutes.includes(to.path)) return navigateTo('/home')
})