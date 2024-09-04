import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersArray = [];
      querySnapshot.forEach((doc) => {
        usersArray.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersArray);
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
    });
    alert('User updated successfully!');
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter((user) => user.id !== userId));
      alert('User deleted successfully!');
    }
  };

  return (
    <div className="user-management-container">
      <h3>Manage Users</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-list-item">
            <div>
              <strong>Email:</strong> {user.email} <br />
              <strong>UID:</strong> {user.id} <br />
              <strong>Role:</strong> {user.role}
            </div>
            <div>
              <button onClick={() => handleUpdateUser(user.id, 'admin')}>Make Admin</button>
              <button onClick={() => handleUpdateUser(user.id, 'user')}>Make User</button>
              <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
