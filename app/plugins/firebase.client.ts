// plugins/firebase.client.ts
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

export default defineNuxtPlugin({
  name: 'firebase',  // 👈 only addition
  setup() {
    const config = useRuntimeConfig()

    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey as string,
      authDomain: config.public.firebaseAuthDomain as string,
      projectId: config.public.firebaseProjectId as string,
      storageBucket: config.public.firebaseStorageBucket as string,
      messagingSenderId: config.public.firebaseMessagingSenderId as string,
      appId: config.public.firebaseAppId as string,
      measurementId: config.public.firebaseMeasurementId as string,
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const provider = new GoogleAuthProvider()

    let analytics = null
    try {
      analytics = getAnalytics(app)
    } catch (e) {
      console.warn('Analytics not available:', e)
    }

    return {
      provide: {
        firebase: { app, analytics, db, auth, provider },
      },
    }
  }
})