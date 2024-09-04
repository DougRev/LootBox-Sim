import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { generateLootBoxItems } from '../utils/simulateLootBox';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from 'firebase/storage';
import '../styles/LootBox.css';

const LootBox = ({ lootBox, allItems }) => {
  const [opened, setOpened] = useState(false);
  const [itemsReceived, setItemsReceived] = useState([]);
  const [cardBackImage, setCardBackImage] = useState('');

  useEffect(() => {
    const fetchCardBackImage = async () => {
      try {
        const imageRef = ref(storage, 'public/images/card-back.png');
        const url = await getDownloadURL(imageRef);
        setCardBackImage(url);
      } catch (error) {
        console.error("Failed to load card back image", error);
      }
    };
    fetchCardBackImage();
  }, []);

  const openLootBox = async () => {
    if (!opened) {
      const items = generateLootBoxItems(lootBox, allItems);
      setItemsReceived(items.map(item => ({ ...item, flipped: false })));
      setOpened(true);
  
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          let currentInventory = userDoc.data().inventory || [];
          let newInventory = [...currentInventory, ...items.map(item => item.id)];

          await updateDoc(userRef, { inventory: newInventory });
        } else {
          console.error("User document does not exist");
        }
      } else {
        console.error("No user logged in");
      }
    }
  };

  const revealItem = index => {
    setItemsReceived(items => items.map((item, idx) => 
      idx === index ? { ...item, flipped: true } : item
    ));
  };

  return (
    <div className="loot-box">
      {!opened && (
        <>
          <img src={lootBox.image} alt={lootBox.name} />
          <h3>{lootBox.name}</h3>
          <p>{lootBox.description}</p>
          <button onClick={openLootBox}>Open This Box</button>
        </>
      )}
      {opened && (
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
      )}
    </div>
  );
};

export default LootBox;
