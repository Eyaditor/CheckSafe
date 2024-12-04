import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB--v6z4lcCKIVfzlmZO_mAf5NrRioG3ec",
    authDomain: "checksafe-cpit405.firebaseapp.com",
    projectId: "checksafe-cpit405",
    storageBucket: "checksafe-cpit405.firebasestorage.app",
    messagingSenderId: "585934666232",
    appId: "1:585934666232:web:0cbda700cefa8806dffe0d",
    measurementId: "G-K3ZT4D2X86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };