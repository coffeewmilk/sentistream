import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as _signout, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "[apiKey]",
    authDomain: "sentistream-420115.firebaseapp.com",
    projectId: "sentistream-420115",
    storageBucket: "sentistream-420115.appspot.com",
    messagingSenderId: "[messagingSenderId]",
    appId: "[appId]",
    measurementId: "[measurementId]"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize database 
export const db = getFirestore(app);

export async function signIn({email, password}: {email: string, password: string}) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential
}

export async function register({email, password}: {email: string, password: string}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential
}

export async function verifyEmail() {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
    }
}

export async function signOut() {
    await _signout(auth)
}