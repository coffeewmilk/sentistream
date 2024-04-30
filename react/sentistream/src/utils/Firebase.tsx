import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as _signout } from "firebase/auth";


// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "[apiKey]",
    authDomain: "sentistream-420115.firebaseapp.com",
    projectId: "sentistream-420115",
    storageBucket: "sentistream-420115.appspot.com",
    messagingSenderId: "[messagingSenderId]",
    appId: "1:[messagingSenderId]:web:025c67cc0c6a0b624d9aa9",
    measurementId: "[measurementId]"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export async function signIn({email, password}: {email: string, password: string}) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential
}

export async function register({email, password, rePassword}: {email: string, password: string, rePassword: string}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential
}

export async function signOut() {
    await _signout(auth)
}