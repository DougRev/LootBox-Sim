import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { generateLootBoxItems } from '../utils/simulateLootBox';
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { ref, getDownloadURL } from 'firebase/storage';
import { useUser } from '../contexts/UserContext';
import '../styles/LootBox.css';

const LootBox = ({ lootBox, allItems }) => {
  const [opened, setOpened] = useState(false);
  const [itemsReceived, setItemsReceived] = useState([]);
  const [cardBackImage, setCardBackImage] = useState('');
  const { userGold, setUserGold } = useUser();

  useEffect(() => {
    // Pre-fetch the card back image
    const fetchCardBackImage = async () => {
      try {
        const url = await getDownloadURL(ref(storage, 'public/images/card-back.png'));
        setCardBackImage(url);
      } catch (error) {
        console.error("Failed to load card back image", error);
      }
    };
    fetchCardBackImage();
  }, []);

  const openLootBox = async () => {
    if (!opened && userGold >= lootBox.cost) {
      const newGold = userGold - lootBox.cost;
      setUserGold(newGold);
      const items = generateLootBoxItems(lootBox, allItems);
      setItemsReceived(items.map(item => ({ ...item, flipped: false })));
      setOpened(true);
  
      // Update user's gold
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { gold: newGold });
  
      // Update user's inventory with new items
      const userDoc = await getDoc(userRef);
      const currentInventory = userDoc.data().inventory || [];
      const updatedInventory = [...currentInventory, ...items.map(item => item.id)];
      await updateDoc(userRef, { inventory: updatedInventory });
    } else if (userGold < lootBox.cost) {
      alert("Not enough gold to open the loot box.");
    }
  };

  const revealItem = index => {
    setItemsReceived(items => items.map((item, idx) => 
      idx === index ? { ...item, flipped: true } : item
    ));
  };

  const handleBack = () => {
    setOpened(false); // Reset the opened state
  };

  return (
    <div className="loot-box">
      {!opened && (
        <>
          <img src={lootBox.image} alt={lootBox.name} style={{ maxWidth: '100%' }} />
          <h3>{lootBox.name} - Cost: {lootBox.cost} Gold</h3>
          <p>{lootBox.description}</p>
          <button onClick={openLootBox}>Buy Box</button>
        </>
      )}
      {opened && (
        <>
          <div className="items-received">
            {itemsReceived.map((item, index) => (
              <div key={index} className={`card ${item.flipped ? 'flipped' : ''}`} onClick={() => !item.flipped && revealItem(index)}>
                <div className="card-back" style={{ backgroundImage: `url(${cardBackImage})` }}>
                  Click to reveal
                </div>
                <div className="card-front">
                  <img className="card-image" src={item.image} alt={item.name} />
                  <h3>{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleBack}>Back to Loot Boxes</button>
        </>
      )}
    </div>
  );
};

export default LootBox;
