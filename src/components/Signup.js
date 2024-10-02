import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import "./style.css"
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "./Header";
import { toast } from "react-toastify";
import Input from "./Input";
import Button from "./Button/Button";
// import Input from "personal-finance-tracker\src\components\Input\index.jsx"
// import Button from '../Button/Button';

function SignupSigningComponent() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,setLoading]=useState(false);
  const[loginForm,setLoginForm]= useState(false) ;
  const navigate=useNavigate();


  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevents the page from refreshing
    console.log({ name, email, password, confirmPassword });
  }
   async function createDoc(user){
    setLoading(true);
    //create a doc
    //if user->sign with email and password 
    //function is same we dont know that signup/signin
    //like its new user or old user we dont so before we create a doc we make sure that doc with uid doesnt exist
    //then we will make user
    if(!user) return;
    const userRef=doc(db,"users",user.uid);
   const userData=await getDoc(userRef);
   if(!userData.exists()){
try{
    await setDoc(doc(db,"users",user.uid),{
      name:user.displayName ? user.displayName:name,
      email:user.email,
      photoURL: user.photoURL ? user.photoURL:"",
      createdAt: new Date(),
    });
    toast.success("Doc created");
    setLoading(false);
  
    }catch(e){
      toast.error(e.message);
      setLoading(false);
  
}
   }else{
    //toast.error("Doc already exists");
    setLoading(false);
   }
   }

   function googleAuth(){
    setLoading(true);
    try{
      signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log("user",user);
    createDoc(user);
    navigate("/dashboard");
    setLoading(false);
   toast.success("User Authenticated");
   
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    toast.error(errorMessage);
    setLoading(false);
 
  
    // ...
  });


    }
    catch(e){
      toast.error(e.message);

    }
    
   }

  function signupWithEmail() {
    setLoading(true);
    console.log("Name", name);
    console.log("Email", email);
    console.log("Password", password);
    console.log("Confirm Password", confirmPassword);

    if(name.length!="" && email!="" && password!="" && confirmPassword!="" )
    {
   if(password===confirmPassword){
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user; //creates user
        console.log("User->>",user);
        toast.success("User created");
        setLoading(false);
        setName('');
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        createDoc(user); //pass the user
        navigate("/dashboard");
        
        // ...
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(errorMessage);
        setLoading(false);
        // ..

      });
   }
   else{
    toast.error("password and confirm password should match");
    setLoading(false);
   }
    }
    else{
      toast.error("All Fields are mandatory");
      setLoading(false);
    }

  }
  function loginUsingEmail(){
    console.log("Email",email);
    console.log("Password",password);
    setLoading(true);

    if( email!="" && password!=""  )
    {
      signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    toast.success("User Logged In");
    setLoading(false);
    navigate("/dashboard");

    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    setLoading(false);
    toast.error(errorMessage);
  });

  }
  else{
    toast.error("All Fields are mandatory");
    setLoading(false);
  }

    }




  return (
    <>
    {loginForm?<>
      <div className='signup-wrapper'>
      <h2 className='title'>Login on <span style={{ color: "var(--theme)" }}>Financely.</span></h2>
      <form className='form' onSubmit={handleSubmit}>
      

        <Input
          type="email"
          label={'Email'}
          state={email}
          setState={setEmail}
          placeholder={"JohnDoe@gmail.com"}
        />

        <Input
          type="password"
          label={'Password'}
          state={password}
          setState={setPassword}
          placeholder={"Example123"}
        />

    

        <Button text={loading?"Loading..":"Login using email and password"} type="submit" onClick={loginUsingEmail}
        disabled={loading}
         />
      <p className='p-login'>OR</p>
        <Button onClick={googleAuth} text={loading?"Loading..":" Login using Google"} blue={true} type="submit" />

        <p
        className='p-login'
        style={{cursor:"pointer"}}
       onClick={()=>setLoginForm(!loginForm)}
        >
       Or  Have An Account Already ? Click Here
        
        </p>
      </form>
    </div>
    </>: 
    <div className='signup-wrapper'>
    <h2 className='title'>Sign Up on <span style={{ color: "var(--theme)" }}>Financely.</span></h2>
    <form className='form' onSubmit={handleSubmit}>
      <Input
        label={'Full Name'}
        state={name}
        setState={setName}
        placeholder={"John Doe"}
      />

      <Input
        type="email"
        label={'Email'}
        state={email}
        setState={setEmail}
        placeholder={"JohnDoe@gmail.com"}
      />

      <Input
        type="password"
        label={'Password'}
        state={password}
        setState={setPassword}
        placeholder={"Example123"}
      />

      <Input
        type="password"
        label={'Confirm Password'}
        state={confirmPassword}
        setState={setConfirmPassword}
        placeholder={"Example123"}
      />

      {/* Make sure the Button component accepts props like type */}

      <Button text={loading?"Loading..":"Sign Up using email and password"} type="submit" onClick={signupWithEmail}
      disabled={loading}
       />
      <p className='p-login'>OR</p>
      <Button  onClick={googleAuth}text={loading?"Loading..":"Sign Up using Google"} blue={true} type="submit" />

      
         <p
         className='p-login'
         style={{cursor:"pointer"}}
        onClick={()=>setLoginForm(!loginForm)}
         >
          

        Or have an accout already? Click here </p>
    </form>
  </div>}
    
    </>
  )
}

export default SignupSigningComponent;
