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
    const fetchCardBackImage = async () => {
      try {
        const url = await getDownloadURL(ref(storage, 'public/images/card-back.png'));
        setCardBackImage(url);
        console.log("Card back image loaded successfully.");
      } catch (error) {
        console.error("Failed to load card back image", error);
      }
    };
    fetchCardBackImage();
  }, []);

  const openLootBox = async () => {
    if (!opened && userGold >= lootBox.cost) {
      console.log("Attempting to open loot box:", lootBox.name);
      const newGold = userGold - lootBox.cost;
      setUserGold(newGold);
      const items = generateLootBoxItems(lootBox, allItems);
      console.log("Items generated:", items);
      setItemsReceived(items.map(item => ({ ...item, flipped: false })));
      setOpened(true);
  
      // Update user's gold
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { gold: newGold });
      console.log(`Gold updated to ${newGold}`);
  
      // Fetch the current inventory, then update
      const userDoc = await getDoc(userRef);
      const currentInventory = userDoc.data().inventory || [];
  
      // Include new items, allowing duplicates
      const updatedInventory = [...currentInventory, ...items.map(item => item.id)];
  
      // Update the inventory in Firestore
      await updateDoc(userRef, { inventory: updatedInventory });
      console.log("Inventory updated with new items.");
    } else if (userGold < lootBox.cost) {
      console.error("Not enough gold to open the loot box.");
      alert("Not enough gold.");
    }
  };
  

  const revealItem = index => {
    setItemsReceived(items => items.map((item, idx) => 
      idx === index ? { ...item, flipped: true } : item
    ));
    console.log(`Item at index ${index} revealed.`);
  };

  const handleBack = () => {
    console.log("Returning to loot box selection.");
    setOpened(false); // Reset the opened state to show the loot box list again
  };

  return (
    <div className="loot-box">
      {!opened && (
        <>
          <img src={lootBox.image} alt={lootBox.name} />
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
