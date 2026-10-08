let StandardItemClass = (typeof StandardItem !== 'undefined') ? StandardItem : null;
let PerishableItemClass = (typeof PerishableItem !== 'undefined') ? PerishableItem : null;
let FragileItemClass = (typeof FragileItem !== 'undefined') ? FragileItem : null;

if (typeof require !== 'undefined') {
  const models = require('../models/Item');
  StandardItemClass = models.StandardItem;
  PerishableItemClass = models.PerishableItem;
  FragileItemClass = models.FragileItem;
}

// Factory Pattern: creates different item instances based on type
class ItemFactory {
  static createItem(type, data) {
    const { id, name, category, price, quantity } = data;

    switch (type.toLowerCase()) {
      case 'standard':
        return new StandardItemClass(id, name, category, price, quantity);

      case 'perishable':
        return new PerishableItemClass(id, name, category, price, quantity, data.expiryDate);

      case 'fragile':
        return new FragileItemClass(id, name, category, price, quantity, data.handlingFee);

      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ItemFactory;
} else if (typeof window !== 'undefined') {
  window.ItemFactory = ItemFactory;
}

