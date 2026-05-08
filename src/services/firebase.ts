import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgiwCi3yKlTaf8lhcRCYPLcHQD6syH1Ds",
  authDomain: "rio7-meeting.firebaseapp.com",
  projectId: "rio7-meeting",
  storageBucket: "rio7-meeting.firebasestorage.app",
  messagingSenderId: "856687113190",
  appId: "1:856687113190:web:8b0c575d70fa3f033d1c27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'consent'
});

// Add scopes for Google Calendar and Drive
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
