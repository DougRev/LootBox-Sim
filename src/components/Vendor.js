import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import '../styles/Vendor.css';  // Make sure this path is correct

const Vendor = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const { userGold, setUserGold } = useUser();

  useEffect(() => {
    const fetchInventory = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const inventoryMap = {};
          if (data.inventory && data.inventory.length > 0) {
            console.log('Fetching item details for inventory IDs:', data.inventory);
            const promises = data.inventory.map(itemId => getDoc(doc(db, 'items', itemId)));
            const docs = await Promise.all(promises);
            docs.forEach(doc => {
              if (doc.exists()) {
                const itemData = doc.data();
                const itemId = doc.id;
                if (!inventoryMap[itemId]) {
                  inventoryMap[itemId] = { ...itemData, id: itemId, count: 1 };
                } else {
                  inventoryMap[itemId].count += 1;
                }
              }
            });
            setInventoryItems(Object.values(inventoryMap));
            console.log('Detailed Inventory:', Object.values(inventoryMap));
          } else {
            setInventoryItems([]);
            console.log('No inventory items found or empty inventory.');
          }
        } else {
          console.log('User document does not exist.');
        }
      }
    };

    fetchInventory();
  }, []);

  const handleSellItem = async (itemId, value) => {
    const updatedInventoryItems = inventoryItems.map(item => {
      if (item.id === itemId && item.count > 1) {
        return { ...item, count: item.count - 1 };
      } else if (item.id === itemId && item.count === 1) {
        return null;  // This will filter out the item completely if count goes to zero
      }
      return item;
    }).filter(item => item !== null);

    setInventoryItems(updatedInventoryItems);
    setUserGold(userGold + value);

    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, {
      gold: increment(value),
      inventory: updatedInventoryItems.map(item => item.id)  // Assuming each item only stored once
    });
    console.log(`Sold item ${itemId}, updated gold and inventory in Firestore.`);
  };

  return (
    <div className="vendor-wrapper">
      <h1 className="vendor-title">Vendor</h1>
      <table className="vendor-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Count</th>
            <th>Value</th>
            <th>Sell</th>
          </tr>
        </thead>
        <tbody>
          {inventoryItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.count}</td>
              <td>{item.value.toLocaleString()}</td>
              <td>
                <button className="vendor-button" onClick={() => handleSellItem(item.id, item.value)}>Sell</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vendor;
