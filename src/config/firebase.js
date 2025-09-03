import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAAd5DSy43vi9AsBKsUKcL7baf3w7blIOM',
  authDomain: 'techno-webapp.firebaseapp.com',
  databaseURL: 'https://techno-webapp-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'techno-webapp',
  storageBucket: 'techno-webapp.firebasestorage.app',
  messagingSenderId: '193747640510',
  appId: '1:193747640510:web:71ab9709cbbc9d1f077eef',
  measurementId: 'G-X5EH85VVTJ',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
