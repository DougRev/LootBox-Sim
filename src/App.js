import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NavBar from './components/NavBar';
import LootBoxes from './pages/LootBoxes';
import Inventory from './components/Inventory';
import Market from './pages/Market';
import { useUser } from './contexts/UserContext';
import { auth } from './firebase';
import './App.css';

function App() {
  const { user, setUser } = useUser();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="appContainer">
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <AuthForm />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/lootboxes" element={user ? <LootBoxes userId={user.uid} /> : <Navigate to="/" />} />
        <Route path="/inventory" element={user ? <Inventory userId={user.uid} /> : <Navigate to="/" />} />
        <Route path="/market" element={<Market />} />
        </Routes>
    </Router>
    </div>
  );
}

export default App;
