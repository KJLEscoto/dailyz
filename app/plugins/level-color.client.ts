// plugins/level-color.client.ts
export default defineNuxtPlugin(() => {
  const cookie = useCookie('level-color')
  if (cookie.value) {
    document.documentElement.style.setProperty('--color-primary', cookie.value)
  }
})