// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7kOOuEecndfektVkjh_g8Rq0FnVTvzFM",
  authDomain: "ai-tutor-ed7e4.firebaseapp.com",
  projectId: "ai-tutor-ed7e4",
  storageBucket: "ai-tutor-ed7e4.firebasestorage.app",
  messagingSenderId: "621576182854",
  appId: "1:621576182854:web:5c90e510e2430147553e47",
  measurementId: "G-M8D2788XTR"
};

const app = !getApp.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);