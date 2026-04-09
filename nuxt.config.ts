// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const siteTitle = "Dailyz | KinWebb";
const siteDescription =
  "A mindful habit tracker designed to keep you consistent — track your daily habits, celebrate streaks, and stay inspired with a fresh quote and nature photo every day. Designed and developed by KinWebb. © 2026 Kent Joemar Escoto.";
const siteVerification = "eMMfU0WDt9Hz-TWRGBTQY-mgFsF66m9octorJRumMzQ";
const siteThumbnail = "https://kinwebb.netlify.app/dailyz_thumbnail.png";
const siteIcon = "/images/Icon.png";


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ["@nuxt/fonts", 'kinwebb-attribute', '@pinia/nuxt'],
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
  app: {
    head: {
      title: siteTitle,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },

        // search console verification
        { name: "google-site-verification", content: siteVerification },

        // SEO
        { name: "description", content: siteDescription },

        // Open Graph (previews: FB, Discord, iMessage, etc.)
        { property: "og:type", content: "website" },
        { property: "og:title", content: siteTitle },
        { property: "og:description", content: siteDescription },
        // { property: "og:image", content: siteThumbnail },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/png" },

        // Twitter/X
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: siteTitle },
        { name: "twitter:description", content: siteDescription },
        // { name: "twitter:image", content: siteThumbnail },
      ],
      // link: [{ rel: "icon", type: "image/png", href: siteIcon }],
    },
  },
  runtimeConfig: {  
    unsplashKey: process.env.NUXT_PUBLIC_UNSPLASH_KEY,
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      firebaseMeasurementId: '',
    },
  },
})
