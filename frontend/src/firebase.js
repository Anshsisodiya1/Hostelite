// src/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDLwovaug32h6rRy0LckbRXUy0tcwH0Yao",
  authDomain: "hostelite-2585a.firebaseapp.com",
  projectId: "hostelite-2585a",
  storageBucket: "hostelite-2585a.firebasestorage.app",
  messagingSenderId: "673206820752",
  appId: "1:673206820752:web:bd2fbcfcd1a3101a11dd15",
  measurementId: "G-3LBWVXBMDP"
};

// ✅ INIT APP
const app = initializeApp(firebaseConfig);

// ✅ INIT MESSAGING
const messaging = getMessaging(app);

// ✅ EXPORT BOTH
export { app, messaging };