// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// IMPORT DATABASE UTILS UNTUK REALTIME DATABASE
import { getDatabase } from "firebase/database"; 

import { getAuth } from "firebase/auth"; // 👈 Tambahkan ini

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvnEK5TTQZ8Qijp80V90P6i2nnFMcLdxw",
  authDomain: "tumbara-bea7a.firebaseapp.com",
  databaseURL: "https://tumbara-bea7a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tumbara-bea7a",
  storageBucket: "tumbara-bea7a.firebasestorage.app",
  messagingSenderId: "237548241321",
  appId: "1:237548241321:web:ef725c125818c60de044b8",
  measurementId: "G-YFLBKD1DP3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// INITIALIZE DATABASE DAN EXPORT AGAR BISA DIPAKAI DI HOMEPAGE.JSX
export const db = getDatabase(app);

export const auth = getAuth(app); // 👈 Ekspor auth untuk digunakan di komponen