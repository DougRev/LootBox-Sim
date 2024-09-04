import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import LootBox from '../components/LootBox';
import '../styles/LootBoxes.css';

const LootBoxes = () => {
  const [lootBoxes, setLootBoxes] = useState([]);
  const [allItems, setAllItems] = useState([]); 
  const [selectedBox, setSelectedBox] = useState(null);

  useEffect(() => {
    const fetchLootBoxes = async () => {
      const lootBoxSnapshot = await getDocs(collection(db, 'lootBoxes'));
      const itemSnapshot = await getDocs(collection(db, 'items'));
      const items = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const boxesWithImages = await Promise.all(lootBoxSnapshot.docs.map(async (doc) => {
        const boxData = { id: doc.id, ...doc.data() };
        try {
          const imagePath = `public/images/${boxData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
          const imageRef = ref(storage, imagePath);
          boxData.image = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error fetching image for loot box:', error);
          boxData.image = '/path/to/default/image.png'; 
        }
        return boxData;
      }));

      setLootBoxes(boxesWithImages);
      setAllItems(items);  
    };
    fetchLootBoxes();
  }, []);

  const handleSelectBox = (box) => {
    setSelectedBox(box); 
  };

  const handleBackToSelection = () => {
    setSelectedBox(null);
  };

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
