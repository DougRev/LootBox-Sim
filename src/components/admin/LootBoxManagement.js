import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/LootBoxManagement.css';

const LootBoxManagement = () => {
  const [items, setItems] = useState([]);
  const [lootBoxes, setLootBoxes] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [dropRates, setDropRates] = useState({
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(100);
  const [formVisible, setFormVisible] = useState(false);
  const [editingLootBoxId, setEditingLootBoxId] = useState(null);

  useEffect(() => {
    const fetchItemsAndLootBoxes = async () => {
      const itemsSnapshot = await getDocs(collection(db, 'items'));
      const lootBoxesSnapshot = await getDocs(collection(db, 'lootBoxes'));
      setItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLootBoxes(lootBoxesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchItemsAndLootBoxes();
  }, []);

  const handleSelectItem = (id) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleDropRateChange = (rarity, value) => {
    const newDropRates = { ...dropRates, [rarity]: Number(value) };
    setDropRates(newDropRates);
    updateTotalPercentage(newDropRates);
  };

  const updateTotalPercentage = (newDropRates) => {
    const total = Object.values(newDropRates).reduce((acc, rate) => acc + rate, 0);
    setTotalPercentage(total);
  };

  const handleLootBoxForm = (lootBox) => {
    if (lootBox) {
      setName(lootBox.name);
      setDescription(lootBox.description);
      setDropRates(lootBox.dropRates);
      setCost(lootBox.cost)
      setSelectedItems(new Set(lootBox.items.map(item => item.itemId)));
      setEditingLootBoxId(lootBox.id);
    } else {
      resetForm();
    }
    setFormVisible(true);
  };

  const saveLootBox = async () => {
    if (totalPercentage !== 100) {
      alert('Total percentage must equal 100%');
      return;
    }
    const lootBoxItems = items.filter(item => selectedItems.has(item.id));
    const lootBox = {
      name,
      description,
      items: lootBoxItems.map(item => ({ itemId: item.id, rarity: item.rarity })),
      dropRates,
      cost
    };

    if (editingLootBoxId) {
      await updateDoc(doc(db, 'lootBoxes', editingLootBoxId), lootBox);
      alert('Loot Box Updated Successfully!');
    } else {
      await addDoc(collection(db, 'lootBoxes'), lootBox);
      alert('Loot Box Saved Successfully!');
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCost(0);
    setDropRates({
      common: 65,
      uncommon: 25,
      rare: 7,
      epic: 2,
      legendary: 1,
      mythic: 0
    });
    setSelectedItems(new Set());
    setEditingLootBoxId(null);
    setFormVisible(false);
  };

  const handleDeleteLootBox = async (id) => {
    await deleteDoc(doc(db, 'lootBoxes', id));
    setLootBoxes(lootBoxes.filter(box => box.id !== id));
  };

  return (
    <div className="loot-box-management">
      <h2>Loot Box Management</h2>
      <button onClick={() => handleLootBoxForm(null)}>Create New Loot Box</button>
      {formVisible && (
        <div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name of Loot Box" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description of Loot Box" />
          <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} placeholder="Cost in Gold" />
          <div className="items-selection">
            {items.map(item => (
              <div key={item.id} className={`item ${selectedItems.has(item.id) ? 'selected' : ''}`} onClick={() => handleSelectItem(item.id)}>
                {item.name} ({item.rarity})
              </div>
            ))}
          </div>
          <div className="drop-rates">
            {['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map(rarity => (
              <div key={rarity}>
                <label>{rarity.charAt(0).toUpperCase() + rarity.slice(1)} Drop Rate:</label>
                <input type="number" value={dropRates[rarity]} onChange={(e) => handleDropRateChange(rarity, e.target.value)} min="0" max="100" />
                %
              </div>
            ))}
            <div>Total: {totalPercentage}%</div>
          </div>
          <button onClick={saveLootBox} disabled={totalPercentage !== 100}>{editingLootBoxId ? 'Update' : 'Save'} Loot Box</button>
          <button onClick={resetForm}>Cancel</button>
        </div>
      )}
      <div className="loot-box-list">
        {lootBoxes.map(box => (
          <div key={box.id} className="loot-box-summary">
            <span>{box.name} - Click for details</span>
            <button onClick={() => handleLootBoxForm(box)}>Edit</button>
            <button onClick={() => handleDeleteLootBox(box.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LootBoxManagement;
