import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDw7TxGzuxkKxlJmVA7JpRtd7TlLwbyapQ",
    authDomain: "divya-yatra-devsprint.firebaseapp.com",
    projectId: "divya-yatra-devsprint",
    storageBucket: "divya-yatra-devsprint.firebasestorage.app",
    messagingSenderId: "84218114904",
    appId: "1:84218114904:web:d57fb91b05eafa565beb2d",
    measurementId: "G-818NMSX6NZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export default app;
