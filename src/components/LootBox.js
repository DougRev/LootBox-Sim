import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { generateLootBoxItems } from '../utils/simulateLootBox';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from 'firebase/storage';
import { useUser } from '../contexts/UserContext';
import '../styles/LootBox.css';

const LootBox = ({ lootBox, allItems, onBack }) => {
  const [opened, setOpened] = useState(false);
  const [itemsReceived, setItemsReceived] = useState([]);
  const [cardBackImage, setCardBackImage] = useState('');
  const { userGold, setUserGold } = useUser();

  useEffect(() => {
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
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { gold: newGold });
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

  const sortedDropRates = Object.entries(lootBox.dropRates)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="loot-box">
      {!opened && (
        <>
          <img src={lootBox.image} alt={lootBox.name} style={{ maxWidth: '100%' }} />
          <h3>{lootBox.name} - Cost: {lootBox.cost} Gold</h3>
          <p>{lootBox.description}</p>
          <button onClick={openLootBox}>Buy Box</button>
          <button onClick={onBack}>Back to Loot Boxes</button>
          <table className="drop-rates-table">
            <thead>
              <tr>
                <th>Rarity</th>
                <th>Drop Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {sortedDropRates.map(([rarity, rate]) => (
                <tr key={rarity}>
                  <td>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</td>
                  <td>{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <button onClick={onBack}>Back to Loot Boxes</button>
        </>
      )}
    </div>
  );
};

export default LootBox;
