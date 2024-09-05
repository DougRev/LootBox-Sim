import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LootBox from '../components/LootBox';
import '../styles/LootBoxes.css';

const LootBoxes = () => {
  const [lootBoxes, setLootBoxes] = useState([]);
  const [allItems, setAllItems] = useState([]);

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

  return (
    <div className="loot-boxes-container">
      <h1>Select Your Loot Box</h1>
      <div className="loot-box-list">
        {lootBoxes.map(lootBox => (
          <LootBox key={lootBox.id} lootBox={lootBox} allItems={allItems} />
        ))}
      </div>
    </div>
  );
};

export default LootBoxes;
