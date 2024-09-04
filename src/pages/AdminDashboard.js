import React, { useState } from 'react';
import ItemManagement from '../components/admin/ItemManagement';
import UserManagement from '../components/admin/UserManagement';
import LootBoxManagement from '../components/admin/LootBoxManagement';
import '../styles/AdminDashboard.css'; 

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('items');

  const renderComponent = () => {
    switch (activeTab) {
      case 'items':
        return <ItemManagement />;
      case 'users':
        return <UserManagement />;
      case 'lootboxes':
        return <LootBoxManagement />;
      default:
        return <ItemManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('items')} className={activeTab === 'items' ? 'active' : ''}>Items</button>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setActiveTab('lootboxes')} className={activeTab === 'lootboxes' ? 'active' : ''}>Loot Boxes</button>
      </div>
      <div className="tab-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
