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
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "financely-rec-f9ac3.firebaseapp.com",
    projectId: "financely-rec-f9ac3",
    storageBucket: "financely-rec-f9ac3.appspot.com",
    messagingSenderId: "127699886234",
    appId: process.env.REACT_APP_APP_ID,
    measurementId: "G-KPFHYH2D91"
  };
  


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db=getFirestore(app);
  const auth=getAuth(app);
  const provider = new GoogleAuthProvider(); //google auth provider
  export {auth,provider,db,doc,setDoc};