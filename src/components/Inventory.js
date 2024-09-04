import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/Inventory.css';

const Inventory = ({ userId }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeRarity, setActiveRarity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!userId) {
        console.log('User ID is undefined.');
        return;
      }
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const itemIds = userDoc.data().inventory || [];
        const itemQueries = itemIds.map(id => doc(db, 'items', id));
        const itemsSnapshot = await Promise.all(itemQueries.map(getDoc));
        setInventoryItems(itemsSnapshot.filter(doc => doc.exists()).map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
  
    fetchInventory();
  }, [userId, activeRarity]);

  const handleFilterChange = (rarity) => {
    setActiveRarity(rarity);
    setCurrentPage(1);
  };

  const filteredItems = activeRarity === 'all' ? inventoryItems : inventoryItems.filter(item => item.rarity === activeRarity);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="inventory-container">
      <div className="filter-tabs">
        {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map(rarity => (
          <button key={rarity} className={activeRarity === rarity ? 'active' : ''} onClick={() => handleFilterChange(rarity)}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </button>
        ))}
      </div>
      <div className="inventory-grid">
        {displayedItems.map((item, index) => (
          <div key={index} className="inventory-item-card">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="item-rarity">{item.rarity}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => setCurrentPage(page)}>
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
