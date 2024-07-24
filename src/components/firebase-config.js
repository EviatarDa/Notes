// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBWD-s0fQK_9vaH1IZt1v-5K9BbBnJ7sKE",
    authDomain: "notes-dee05.firebaseapp.com",
    projectId: "notes-dee05",
    storageBucket: "notes-dee05.appspot.com",
    messagingSenderId: "391882956786",
    appId: "1:391882956786:web:06362e6afc806b0b65556b",
    measurementId: "G-6XHP65HPYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
