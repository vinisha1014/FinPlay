// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider } from "firebase/auth"; //special,ingenerl auth
import { getFirestore,doc,setDoc } from "firebase/firestore"; 

// TODO: Add SDKs for Firebase products that you want to use
//https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWEfJH4UlWREZSyXguLDyxUJkbgn0ymz0",
  authDomain: "financely-rec-f9ac3.firebaseapp.com",
  projectId: "financely-rec-f9ac3",
  storageBucket: "financely-rec-f9ac3.appspot.com",
  messagingSenderId: "127699886234",
  appId: "1:127699886234:web:293f0dca39671ebbebbf23",
  measurementId: "G-KPFHYH2D91"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db=getFirestore(app);
const auth=getAuth(app);
const provider = new GoogleAuthProvider(); //google auth provider
export {auth,provider,db,doc,setDoc};