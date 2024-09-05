import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
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
        const userItems = userDoc.data().inventory || [];
        // Aggregate counts for each item ID
        const itemCounts = userItems.reduce((acc, itemId) => {
          acc[itemId] = (acc[itemId] || 0) + 1;
          return acc;
        }, {});

        // Fetch details for each unique item
        const itemsDetails = await Promise.all(
          Object.entries(itemCounts).map(async ([itemId, count]) => {
            const itemDoc = await getDoc(doc(db, 'items', itemId));
            return {
              ...itemDoc.data(),
              id: itemDoc.id,
              count: count
            };
          })
        );
        setInventoryItems(itemsDetails);
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
        {displayedItems.map((item) => (
          <div key={item.id} className="inventory-item-card">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="item-rarity">{item.rarity}</span>
              <span className="item-count">Count: {item.count}</span> 
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
