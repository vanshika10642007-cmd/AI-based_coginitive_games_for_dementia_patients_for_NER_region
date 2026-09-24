/* Firebase is loaded with the browser-compatible SDK so this project can stay
   a plain Express + Vanilla JS app (no bundler required). */
const firebaseConfig = {
  apiKey: "AIzaSyBjEyDn26RyNmi8obzCyi02WWw9oDrgnZA",
  authDomain: "dementia-cognitive-platform.firebaseapp.com",
  projectId: "dementia-cognitive-platform",
  storageBucket: "dementia-cognitive-platform.firebasestorage.app",
  messagingSenderId: "833751527226",
  appId: "1:833751527226:web:ac2e69f3f315e9bb4eaa03"
};

window.firebaseReady = false;
window.firebaseDb = null;
window.firebaseAuth = null;
window.firebaseApp = null;

function initFirebase() {
  try {
    if (!window.firebase || !window.firebase.initializeApp || !window.firebase.firestore) {
      console.warn("Firebase SDK not available; continuing in local/offline mode.");
      return;
    }
    if (!window.firebase.apps.length) {
      window.firebaseApp = window.firebase.initializeApp(firebaseConfig);
    } else {
      window.firebaseApp = window.firebase.app();
    }
    window.firebaseDb = window.firebase.firestore();
    window.firebaseAuth = window.firebase.auth();
    window.firebaseReady = true;
    window.dispatchEvent(new Event("firebase-ready"));
  } catch (error) {
    console.warn("Firebase initialization failed; local mode remains available.", error);
  }
}

if (window.firebase) initFirebase();
else window.addEventListener("firebase-sdk-ready", initFirebase, { once: true });
