import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LootBox from '../components/LootBox';
import '../styles/LootBoxes.css';

const LootBoxes = () => {
  const [lootBoxes, setLootBoxes] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedLootBoxId, setSelectedLootBoxId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [lootBoxSnapshot, itemSnapshot] = await Promise.all([
        getDocs(collection(db, 'lootBoxes')),
        getDocs(collection(db, 'items'))
      ]);

      const items = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllItems(items);

      const boxes = lootBoxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        image: doc.data().image || '/path/to/default/image.png' 
      }));

      setLootBoxes(boxes);
    };

    fetchData();
  }, []);

  const handleSelectLootBox = (id) => {
    setSelectedLootBoxId(id);
  };

  return (
    <div className="loot-boxes-container">
      <h1>Select Your Loot Box</h1>
      <div className="loot-box-list">
        {selectedLootBoxId ? (
          <LootBox lootBox={lootBoxes.find(box => box.id === selectedLootBoxId)} allItems={allItems} onBack={() => setSelectedLootBoxId(null)} />
        ) : (
          lootBoxes.map(lootBox => (
            <div key={lootBox.id} className="loot-box-summary">
              <img src={lootBox.image} alt={lootBox.name} style={{ width: '150px' }} />
              <h3>{lootBox.name} - Cost: {lootBox.cost} Gold</h3>
              <button className="details-btn" onClick={() => handleSelectLootBox(lootBox.id)}>Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LootBoxes;
