import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Dashboard = () => {
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
