// Singleton Pattern: maintains a single shared inventory instance
class InventoryStore {
  constructor() {
    if (InventoryStore.instance) {
      return InventoryStore.instance;
    }

    this.items = [];
    InventoryStore.instance = this;
  }

  static getInstance() {
    if (!InventoryStore.instance) {
      InventoryStore.instance = new InventoryStore();
    }
    return InventoryStore.instance;
  }

  addItem(item) {
    this.items.push(item);
  }

  findItem(id) {
    return this.items.find(item => item.id === id);
  }

  getAllItems() {
    return this.items;
  }

  getLowStockItems(threshold = 5) {
    return this.items.filter(item => item.quantity <= threshold);
  }

  getTotalValue() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  updateItem(id, updates) {
    const item = this.findItem(id);
    if (!item) return false;
    if (updates.name !== undefined) item.name = updates.name;
    if (updates.price !== undefined) item.price = Number(updates.price);
    if (updates.quantity !== undefined) item.quantity = Number(updates.quantity);
    return true;
  }

  deleteItem(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  clear() {
    this.items = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InventoryStore;
} else if (typeof window !== 'undefined') {
  window.InventoryStore = InventoryStore;
}

