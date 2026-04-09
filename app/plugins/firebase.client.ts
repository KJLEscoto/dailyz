import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
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
  const analytics = getAnalytics(app)
  const db = getFirestore(app)

  return {
    provide: {
      firebase: { app, analytics, db },
    },
  }
})