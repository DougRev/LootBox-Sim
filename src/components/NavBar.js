import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

import '../styles/NavBar.css';

const NavBar = () => {
  const { user, setUser, userGold, setIsAdmin, isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === "admin");
        } else {
          setIsAdmin(false); // Ensure admin status is reset if doc doesn't exist
        }
      } else {
        setIsAdmin(false); // Reset admin status when logged out
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [setUser, setIsAdmin]); // Depend on setUser and setIsAdmin to ensure latest setters are used

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
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
            <li className="gold-display">Gold: {userGold.toLocaleString()}</li>
            <li><button className='logout-btn' onClick={handleSignOut}>Sign Out</button></li>
          </>
        ) : (
          <li><Link to="/">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
