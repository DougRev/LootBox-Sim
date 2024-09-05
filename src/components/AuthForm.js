import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../styles/AuthForm.css';

const AuthForm = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered:', userCredential.user);
  

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,  
          gold: 5000, 
          inventory: [],  
          role: "user" 
        });
  
        setIsRegistering(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('User logged in with Google:', result.user);
      

      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
  

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,  
          gold: 5000, 
          inventory: [],  
          role: "user" 
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isRegistering ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">{isRegistering ? 'Sign Up' : 'Login'}</button>
        </form>
        {error && <p>{error}</p>}
        <button onClick={signInWithGoogle}>Sign in with Google</button>
        <p>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
