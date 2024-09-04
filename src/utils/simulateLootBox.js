/**
 * Simulates the opening of a loot box by selecting items based on their rarity and the configured drop rates.
 * @param {Object} lootBox - The loot box configuration, including item IDs and drop rates.
 * @param {Array} allItems - All available items that can be included in the loot box.
 * @param {number} count - The number of items to generate from the loot box.
 * @returns {Array} An array of items selected from the loot box.
 */
function generateLootBoxItems(lootBox, allItems, count = 5) {
    const { dropRates, items: lootBoxItems } = lootBox;
    console.log("Loot box config:", lootBox);
    console.log("All items:", allItems);
    
    // Filter all items to include only those that are in the loot box
    const availableItems = allItems.filter(item => lootBoxItems.some(lbItem => lbItem.itemId === item.id));
  
    // Calculate total weight based on drop rates
    const totalWeight = Object.keys(dropRates).reduce((acc, rarity) => acc + (dropRates[rarity] * (availableItems.filter(item => item.rarity === rarity).length)), 0);
  
    // Function to pick an item based on weighted rarity
    const pickWeightedItem = () => {
      let random = Math.random() * totalWeight;
      for (const rarity of Object.keys(dropRates)) {
        const itemsOfRarity = availableItems.filter(item => item.rarity === rarity);
        let weight = dropRates[rarity] * itemsOfRarity.length;
        
        if (random < weight) {
          const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
          return itemsOfRarity[randomIndex];
        }
        random -= weight;
      }
    };
  
    // Generate the items for the loot box
    const selectedItems = [];
    for (let i = 0; i < count; i++) {
      const item = pickWeightedItem();
      if (item) {
        selectedItems.push(item);
      }
    }
  
    return selectedItems;
  }
  
  export { generateLootBoxItems };
  