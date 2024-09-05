import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userGold, setUserGold] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        console.log(userDoc);
        if (userDoc.exists()) {
          setUserGold(userDoc.data().gold || 0);
          setIsAdmin(userDoc.data().role === "admin"); 
        } else {
          setUserGold(0);
          setIsAdmin(false); 
        }
      } else {
        setUserGold(0);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, userGold, setUserGold, isAdmin, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
};
