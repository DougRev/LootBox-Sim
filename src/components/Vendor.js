import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import '../styles/Vendor.css';

const Vendor = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [gold, setGold] = useState(0);

  useEffect(() => {
    const fetchUserInventory = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userItems = userDoc.data().inventory || [];
          // Create an object to count items
          const itemCounts = userItems.reduce((acc, itemId) => {
            acc[itemId] = (acc[itemId] || 0) + 1;
            return acc;
          }, {});

          // Fetch each item details and count how many of them are in inventory
          const itemsDetails = await Promise.all(
            Object.keys(itemCounts).map(itemId => 
              getDoc(doc(db, 'items', itemId)).then(itemDoc => ({
                ...itemDoc.data(),
                id: itemDoc.id,
                count: itemCounts[itemDoc.id]
              }))
            )
          );

          setInventoryItems(itemsDetails.filter(item => item.count > 0)); // Only show items with count greater than 0
          setGold(userDoc.data().gold || 0); // Set gold from user's data
        }
      }
    };

    fetchUserInventory();
  }, []);

  const handleSellItem = async (item) => {
    const newCount = item.count - 1;
    if (newCount >= 0) {
      setGold(gold + item.value);
      setInventoryItems(inventoryItems.map(it => it.id === item.id ? { ...it, count: newCount } : it).filter(it => it.count > 0));
      updateUserGold(auth.currentUser.uid, item.value);
      updateInventory(auth.currentUser.uid, item.id, -1);
    }
  };

  const updateUserGold = async (userId, amount) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      gold: increment(amount)
    });
  };

  const updateInventory = async (userId, itemId, delta) => {
    const userRef = doc(db, 'users', userId);
    // For simplicity, this is pseudo-code, you'll need to properly manage inventory in Firestore
    await updateDoc(userRef, {
      // Update inventory logic based on your Firestore structure
    });
  };

  return (
    <div>
      <h2>Vendor</h2>
      <div>Your Gold: {gold.toLocaleString()}</div>
      <div className="items-for-sale">
        {inventoryItems.map((item) => (
          <div key={item.id} className="item">
            <img src={item.image} alt={item.name} />
            <p>{item.name} - {item.value.toLocaleString()} Gold (x{item.count})</p>
            <button onClick={() => handleSellItem(item)} disabled={item.count <= 0}>Sell</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vendor;
