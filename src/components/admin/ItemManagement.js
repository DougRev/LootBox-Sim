import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../../firebase';
import '../../styles/ItemManagement.css';

const ItemManagement = () => {
    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [itemRarity, setItemRarity] = useState('common');
    const [itemValue, setItemValue] = useState('');
    const [itemImage, setItemImage] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    const [activeRarity, setActiveRarity] = useState('common');

    const storage = getStorage();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot = await getDocs(collection(db, 'items'));
            const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(fetchedItems);
            filterItems(fetchedItems, 'common'); // default filter to common on load
        };
        fetchItems();
    }, []);


    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setItemImage(e.target.files[0]);
        }
    };

    const handleRarityFilter = (rarity) => {
        setActiveRarity(rarity);
        filterItems(items, rarity);
    };

    const filterItems = (items, rarity) => {
        const filteredItems = items.filter(item => item.rarity === rarity);
        setDisplayItems(filteredItems.slice(0, itemsPerPage));
        setCurrentPage(1);
        setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
    };

    const handlePageChange = (pageNumber) => {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        setDisplayItems(items.slice(startIndex, startIndex + itemsPerPage));
        setCurrentPage(pageNumber);
    };

    const uploadImage = async () => {
        if (!user) {
            alert("You need to be logged in to upload an image.");
            return null;
        }
        if (!itemImage) return null;

        if (itemImage instanceof File) {
            const sanitizedFileName = `${itemImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const imageRef = ref(storage, `images/${user.uid}/${sanitizedFileName}`);
            await uploadBytes(imageRef, itemImage);
            return await getDownloadURL(imageRef);
        } else {
            return itemImage;
        }
    };

    const handleCreateOrUpdateItem = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please sign in to continue.");
            return;
        }

        try {
            const imageUrl = await uploadImage();
            const itemData = {
                name: itemName,
                rarity: itemRarity,
                value: parseInt(itemValue, 10),
                image: imageUrl || itemImage,
            };

            if (editingItemId) {
                await updateDoc(doc(db, 'items', editingItemId), itemData);
                alert('Item updated successfully!');
            } else {
                await addDoc(collection(db, 'items'), itemData);
                alert('Item created successfully!');
            }

            resetForm();
            refreshItemsList();
        } catch (error) {
            console.error("Error handling the item operation:", error);
            alert("Failed to process the item, please try again.");
        }
    };

    const resetForm = () => {
        setItemName('');
        setItemRarity('common');
        setItemValue('');
        setItemImage(null);
        setEditingItemId(null);
    };

    const refreshItemsList = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'items'));
            const newItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(newItems);
            setTotalPages(Math.ceil(newItems.length / itemsPerPage));
            handleRarityFilter(itemRarity); // Maintain the current filter
        } catch (error) {
            console.error("Error refreshing items list:", error);
        }
    };

    const handleEditItem = (item) => {
        setItemName(item.name);
        setItemRarity(item.rarity);
        setItemValue(item.value);
        setItemImage(item.image);
        setEditingItemId(item.id);
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteDoc(doc(db, 'items', itemId));
            refreshItemsList();  // Refresh list after deletion
        }
    };

    return (
        <div className="new-item-container">
            <div className='item-title'>
                <h3>Item Management</h3>
                <button className='add-item-btn' onClick={() => setFormVisible(!formVisible)}>{formVisible ? 'Cancel' : 'Add New Item'}</button>
            </div>
            {formVisible && (
                <form onSubmit={handleCreateOrUpdateItem} className="new-item-form">
                    <input type="text" placeholder="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                    <select value={itemRarity} onChange={(e) => setItemRarity(e.target.value)} required>
                        {['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map(rarity => (
                            <option key={rarity} value={rarity}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</option>
                        ))}
                    </select>
                    <input type="number" placeholder="Item Value" value={itemValue} onChange={(e) => setItemValue(e.target.value)} required />
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                    <button type="submit">{editingItemId ? 'Update Item' : 'Create Item'}</button>
                </form>
            )}
            <div className="rarity-filter">
                {['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'].map(rarity => (
                    <button key={rarity} onClick={() => handleRarityFilter(rarity)} className={activeRarity === rarity ? 'active' : ''}>
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </button>
                ))}
            </div>
            <ul className="item-list">
                {displayItems.map((item) => (
                    <li key={item.id} className="item-list-item">
                        {item.name} - {item.rarity} - ${item.value}
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div>
                            <button onClick={() => handleEditItem(item)}>Edit</button>
                            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => handlePageChange(page)} disabled={currentPage === page} className={currentPage === page ? 'active' : ''}>
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ItemManagement;
