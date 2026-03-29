// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ["@nuxt/fonts", 'kinwebb-attribute'],
  fonts: {
    families: [
      {
        name: "Roboto Condensed",
        provider: "google",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ["normal"],
      },
      {
        name: "Hanken Grotesk",
        provider: "google",
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        styles: ["normal"],
      },
    ],
  },

})
