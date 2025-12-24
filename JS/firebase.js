// /JS/firebase.js - Firebase initialization (vanilla JS compat mode)

// Paste your firebaseConfig object here
const firebaseConfig = {
  apiKey: "AIzaSyBvFpaGeh-LVtC6lxfoqAY2ik3mYO750a0",
  authDomain: "eventsphere-f841c.firebaseapp.com",
  projectId: "eventsphere-f841c",
  storageBucket: "eventsphere-f841c.firebasestorage.app",
  messagingSenderId: "55132695732",
  appId: "1:55132695732:web:08f34041e21bb9e1ef7be1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log("Firebase initialized successful");