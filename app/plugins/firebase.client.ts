// plugins/firebase.client.ts
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin({
  name: 'firebase',  // 👈 only addition
  async setup() {
    const config = useRuntimeConfig()
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
      measurementId: config.public.firebaseMeasurementId,
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const provider = new GoogleAuthProvider()
    const storage = getStorage(app)

    await setPersistence(auth, browserLocalPersistence)

    let analytics = null
    try {
      analytics = getAnalytics(app)
    } catch (e) {
      console.warn('Analytics not available:', e)
    }

    return {
      provide: {
        firebase: { app, analytics, db, auth, provider, storage },
      },
    }
  }
})