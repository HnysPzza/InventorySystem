# Inventory Management System

A modern web-based JavaScript application for the Weeks 1 to 5 activity. It demonstrates core JavaScript concepts and three design patterns (Factory, Singleton, and Strategy) with a responsive UI.

## 1. Project Overview

The application is a web-based inventory management dashboard with full CRUD operations:
1. View All Items (Read)
2. Add New Item (Create - Factory Pattern)
3. Update Item (Update)
4. Delete Item (Delete)
5. Calculate Checkout Price (Strategy Pattern)
6. View Summary and Low-Stock Alerts

## 2. JavaScript Concepts Applied

### Variables (const, let)
- const: Used for fixed values, imports, classes, and object references.
- let: Used for values that change, such as loop flags and calculations.

### Objects and Classes
- Items are created as objects using ES6 classes (Item, StandardItem, PerishableItem, FragileItem).
- Each class stores its own properties (id, name, price, quantity, expiryDate, handlingFee).

### Arrays and Array Methods
- All items are stored in an array (this.items).
- Methods used:
  - push: Adds items to the array.
  - map: Formats and displays items.
  - find: Finds an item by ID.
  - findIndex and splice: Removes an item by ID.
  - filter: Finds items with stock of 5 or less.
  - reduce: Calculates the total value of all stock.

### Functions
- Class methods and arrow functions handle logic, calculations, and data processing.

## 3. Design Patterns Applied

### Factory Pattern (src/factory/ItemFactory.js)
- Purpose: Centralizes item creation.
- Usage: ItemFactory.createItem(type, data) creates the right item object without calling new directly in the main code.

### Singleton Pattern (src/store/InventoryStore.js)
- Purpose: Ensures only one shared inventory exists.
- Usage: InventoryStore.getInstance() always returns the same store instance across the application.

### Strategy Pattern (src/strategies/PricingStrategies.js)
- Purpose: Allows switching pricing calculation rules at runtime.
- Usage: PricingContext can swap between RegularPricing, BulkPricing, and MemberPricing to calculate checkout totals.

## 4. How to Run

### Start the Web Application UI
```bash
npm start
# or: node index.js
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.
*(You can also directly open `index.html` in any web browser without running a server!)*

### Run Tests
```bash
npm test
```

## 5. Web UI Features & Design (shadcn & UI/UX Pro Max)
- **Currency**: Formatted in Philippine Pesos (`₱`) across all cards, tables, and receipts.
- **Theme**: Seamless Light / Dark mode toggle (persisted to `localStorage`).
- **Interactive Patterns**:
  - **Factory Pattern**: "Add Item" dialog creates `StandardItem`, `PerishableItem` (with dynamic expiry date & expired status), or `FragileItem` (with dynamic handling fee).
  - **Singleton Store**: Live centralized inventory reactive to CRUD operations.
  - **Strategy Pattern Checkout**: Swappable runtime algorithms (`RegularPricing`, `BulkPricing` with 10% off for 5+, `MemberPricing` with 15% discount) with live breakdown and stock deduction.
- **Array Methods Visualized**: Real-time stats for `Array.reduce` (Total Inventory Value) and `Array.filter` (Low Stock Alert ≤ 5).

