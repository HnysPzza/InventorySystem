const assert = require('assert');
const ItemFactory = require('../src/factory/ItemFactory');
const InventoryStore = require('../src/store/InventoryStore');
const {
  RegularPricing,
  BulkPricing,
  MemberPricing,
  PricingContext
} = require('../src/strategies/PricingStrategies');

console.log('Running Inventory System Tests...\n');

// 1. Factory Pattern Tests
const keyboard = ItemFactory.createItem('standard', {
  id: 'A1',
  name: 'Keyboard',
  category: 'Electronics',
  price: 50,
  quantity: 10
});
assert.strictEqual(keyboard.type, 'standard');
assert.strictEqual(keyboard.name, 'Keyboard');

const milk = ItemFactory.createItem('perishable', {
  id: 'A2',
  name: 'Milk',
  category: 'Groceries',
  price: 3,
  quantity: 2,
  expiryDate: '2026-12-31'
});
assert.strictEqual(milk.type, 'perishable');
assert.strictEqual(typeof milk.isExpired, 'function');

const vase = ItemFactory.createItem('fragile', {
  id: 'A3',
  name: 'Glass Vase',
  category: 'Decor',
  price: 25,
  quantity: 4,
  handlingFee: 8
});
assert.strictEqual(vase.type, 'fragile');
assert.strictEqual(vase.handlingFee, 8);

assert.throws(() => {
  ItemFactory.createItem('invalid', { id: 'ERR', name: 'X', category: 'X', price: 1, quantity: 1 });
}, /Unsupported item type/);

console.log('✔ Factory Pattern tests passed');

// 2. Singleton Pattern Tests
const store1 = InventoryStore.getInstance();
const store2 = InventoryStore.getInstance();
const store3 = new InventoryStore();

assert.strictEqual(store1, store2);
assert.strictEqual(store2, store3);

store1.clear();
store1.addItem(keyboard);
store2.addItem(milk);
store2.addItem(vase);

assert.strictEqual(store3.getAllItems().length, 3);
console.log('✔ Singleton Pattern tests passed');

// 3. Array Operations Tests
const found = store1.findItem('A2');
assert.strictEqual(found.name, 'Milk');

const lowStock = store1.getLowStockItems(5);
assert.strictEqual(lowStock.length, 2); // milk (2) and vase (4)

const totalVal = store1.getTotalValue();
// (50 * 10) + (3 * 2) + (25 * 4) = 500 + 6 + 100 = 606
assert.strictEqual(totalVal, 606);

// CRUD update & delete tests
const updated = store1.updateItem('A1', { price: 60, quantity: 8 });
assert.strictEqual(updated, true);
assert.strictEqual(keyboard.price, 60);
assert.strictEqual(keyboard.quantity, 8);

const deleted = store1.deleteItem('A2');
assert.strictEqual(deleted, true);
assert.strictEqual(store1.getAllItems().length, 2);
assert.strictEqual(store1.findItem('A2'), undefined);

console.log('✔ Array & CRUD methods (.find, .filter, .reduce, update, delete) tests passed');

// 4. Strategy Pattern Tests
const pricing = new PricingContext(new RegularPricing());
assert.strictEqual(pricing.calculateTotal(50, 2), 100);

pricing.setStrategy(new BulkPricing());
assert.strictEqual(pricing.calculateTotal(50, 4), 200); // no bulk (< 5)
assert.strictEqual(pricing.calculateTotal(50, 5), 225); // 10% off (250 * 0.9 = 225)

pricing.setStrategy(new MemberPricing());
assert.strictEqual(pricing.calculateTotal(100, 2), 170); // 15% off (200 * 0.85 = 170)

console.log('✔ Strategy Pattern tests passed');

console.log('\nAll tests passed successfully!');
