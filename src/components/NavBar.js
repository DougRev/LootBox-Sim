import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/NavBar.css';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        {user ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {isAdmin && <li><Link to="/admin">Admin Dashboard</Link></li>}
            <li><Link to="/lootboxes">Loot Boxes</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/market">Market</Link></li>
            <li><button onClick={handleSignOut}>Sign Out</button></li>
          </>
        ) : (
          <li><Link to="/">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
