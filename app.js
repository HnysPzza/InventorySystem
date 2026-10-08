/**
 * INVENTORY MANAGEMENT SYSTEM - WEB CONTROLLER
 * Applies GoF Patterns: Factory, Singleton, Strategy
 * Follows UI/UX Pro Max and Shadcn design principles
 */

(function () {
  'use strict';

  // --- Fallback OOP Definitions in case external scripts are blocked on file:/// ---
  const ItemClass = window.Item || class Item {
    constructor(id, name, category, price, quantity) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.price = Number(price);
      this.quantity = Number(quantity);
    }
    getInfo() {
      return `${this.name} (${this.category}) - ₱${this.price} | Stock: ${this.quantity}`;
    }
  };

  const StandardItemClass = window.StandardItem || class StandardItem extends ItemClass {
    constructor(id, name, category, price, quantity) {
      super(id, name, category, price, quantity);
      this.type = 'standard';
    }
  };

  const PerishableItemClass = window.PerishableItem || class PerishableItem extends ItemClass {
    constructor(id, name, category, price, quantity, expiryDate) {
      super(id, name, category, price, quantity);
      this.type = 'perishable';
      this.expiryDate = new Date(expiryDate);
    }
    isExpired() {
      return new Date() > this.expiryDate;
    }
  };

  const FragileItemClass = window.FragileItem || class FragileItem extends ItemClass {
    constructor(id, name, category, price, quantity, handlingFee = 5) {
      super(id, name, category, price, quantity);
      this.type = 'fragile';
      this.handlingFee = Number(handlingFee);
    }
  };

  const ItemFactoryClass = window.ItemFactory || class ItemFactory {
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
  };

  const InventoryStoreClass = window.InventoryStore || class InventoryStore {
    constructor() {
      if (InventoryStore.instance) return InventoryStore.instance;
      this.items = [];
      InventoryStore.instance = this;
    }
    static getInstance() {
      if (!InventoryStore.instance) InventoryStore.instance = new InventoryStore();
      return InventoryStore.instance;
    }
    addItem(item) { this.items.push(item); }
    findItem(id) { return this.items.find(item => item.id === id); }
    getAllItems() { return this.items; }
    getLowStockItems(threshold = 5) { return this.items.filter(item => item.quantity <= threshold); }
    getTotalValue() { return this.items.reduce((total, item) => total + (item.price * item.quantity), 0); }
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
    clear() { this.items = []; }
  };

  const RegularPricingClass = window.RegularPricing || class RegularPricing {
    calculate(price, quantity) { return price * quantity; }
  };

  const BulkPricingClass = window.BulkPricing || class BulkPricing {
    calculate(price, quantity) {
      const subtotal = price * quantity;
      return quantity >= 5 ? subtotal * 0.90 : subtotal;
    }
  };

  const MemberPricingClass = window.MemberPricing || class MemberPricing {
    calculate(price, quantity) { return (price * quantity) * 0.85; }
  };

  const PricingContextClass = window.PricingContext || class PricingContext {
    constructor(strategy = new RegularPricingClass()) {
      this.strategy = strategy;
    }
    setStrategy(strategy) { this.strategy = strategy; }
    calculateTotal(price, quantity) {
      return Number(this.strategy.calculate(price, quantity).toFixed(2));
    }
  };

  // --- State Initialization ---
  const STORAGE_KEY = 'inventory_system_storage_v2';
  const store = InventoryStoreClass.getInstance();

  function seedDefaultData() {
    store.clear();
    store.addItem(ItemFactoryClass.createItem('standard', {
      id: 'A1',
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 25.00,
      quantity: 12
    }));

    store.addItem(ItemFactoryClass.createItem('perishable', {
      id: 'A2',
      name: 'Fresh Milk',
      category: 'Dairy',
      price: 3.50,
      quantity: 4,
      expiryDate: '2026-10-20'
    }));

    store.addItem(ItemFactoryClass.createItem('fragile', {
      id: 'A3',
      name: 'Ceramic Mug',
      category: 'Kitchen',
      price: 12.00,
      quantity: 3,
      handlingFee: 2.50
    }));
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      seedDefaultData();
      saveToStorage();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      store.clear();
      parsed.forEach(itemData => {
        store.addItem(ItemFactoryClass.createItem(itemData.type || 'standard', itemData));
      });
    } catch (e) {
      console.warn('Failed to parse localStorage, resetting to seed data.', e);
      seedDefaultData();
      saveToStorage();
    }
  }

  function saveToStorage() {
    try {
      const plainItems = store.getAllItems().map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : undefined,
        handlingFee: item.handlingFee
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plainItems));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- Currency Formatter (Philippine Peso) ---
  function formatPeso(amount) {
    return `₱${Number(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // --- UI Elements ---
  const kpiTotalValue = document.getElementById('kpiTotalValue');
  const kpiTotalItems = document.getElementById('kpiTotalItems');
  const kpiTotalUnits = document.getElementById('kpiTotalUnits');
  const kpiLowStock = document.getElementById('kpiLowStock');
  const kpiLowStockLabel = document.getElementById('kpiLowStockLabel');
  const kpiStandardCount = document.getElementById('kpiStandardCount');
  const kpiPerishableCount = document.getElementById('kpiPerishableCount');
  const kpiFragileCount = document.getElementById('kpiFragileCount');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabLowStockBadge = document.getElementById('tabLowStockBadge');
  const filterBar = document.getElementById('filterBar');
  const tableSection = document.getElementById('tableSection');
  const checkoutSection = document.getElementById('checkoutSection');
  const architectureSection = document.getElementById('architectureSection');

  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const sortSelect = document.getElementById('sortSelect');
  const inventoryTableBody = document.getElementById('inventoryTableBody');
  const emptyState = document.getElementById('emptyState');
  const btnClearFilters = document.getElementById('btnClearFilters');

  // Checkout Elements
  const checkoutItemSelect = document.getElementById('checkoutItemSelect');
  const checkoutQuantityInput = document.getElementById('checkoutQuantityInput');
  const checkoutItemStockHint = document.getElementById('checkoutItemStockHint');
  const cardStrategyRegular = document.getElementById('cardStrategyRegular');
  const cardStrategyBulk = document.getElementById('cardStrategyBulk');
  const cardStrategyMember = document.getElementById('cardStrategyMember');
  const receiptItemName = document.getElementById('receiptItemName');
  const receiptUnitPrice = document.getElementById('receiptUnitPrice');
  const receiptQty = document.getElementById('receiptQty');
  const receiptSubtotal = document.getElementById('receiptSubtotal');
  const receiptDiscountRow = document.getElementById('receiptDiscountRow');
  const receiptDiscountVal = document.getElementById('receiptDiscountVal');
  const receiptHandlingRow = document.getElementById('receiptHandlingRow');
  const receiptHandlingVal = document.getElementById('receiptHandlingVal');
  const receiptFinalTotal = document.getElementById('receiptFinalTotal');
  const receiptStrategyBadge = document.getElementById('receiptStrategyBadge');
  const btnProcessCheckout = document.getElementById('btnProcessCheckout');

  // Modals
  const modalAddItem = document.getElementById('modalAddItem');
  const formAddItem = document.getElementById('formAddItem');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const addType = document.getElementById('addType');
  const addTypeButtons = document.querySelectorAll('#modalAddItem .type-btn');
  const groupExpiry = document.getElementById('groupExpiry');
  const groupHandling = document.getElementById('groupHandling');
  const addExpiryDate = document.getElementById('addExpiryDate');
  const addHandlingFee = document.getElementById('addHandlingFee');

  const modalEditItem = document.getElementById('modalEditItem');
  const formEditItem = document.getElementById('formEditItem');
  const editId = document.getElementById('editId');
  const editIdDisplay = document.getElementById('editIdDisplay');
  const editName = document.getElementById('editName');
  const editPrice = document.getElementById('editPrice');
  const editQuantity = document.getElementById('editQuantity');

  const modalDeleteItem = document.getElementById('modalDeleteItem');
  const deleteItemId = document.getElementById('deleteItemId');
  const deleteItemName = document.getElementById('deleteItemName');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  const btnResetSeed = document.getElementById('btnResetSeed');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');
  const toastContainer = document.getElementById('toastContainer');

  let currentTab = 'catalog'; // 'catalog' | 'lowstock' | 'checkout' | 'architecture'
  let itemPendingDelete = null;

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem('inventory_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    } else {
      document.documentElement.classList.remove('dark');
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    }
  }

  btnThemeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('inventory_theme', isDark ? 'dark' : 'light');
    iconSun.style.display = isDark ? 'block' : 'none';
    iconMoon.style.display = isDark ? 'none' : 'block';
    showToast('Theme updated', isDark ? 'Dark mode enabled.' : 'Light mode enabled.', 'info');
  });

  // --- Toast Notification System (Shadcn Sonner Style) ---
  function showToast(title, desc, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
      </div>
    `;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }

  // --- Render KPI Metric Cards ---
  function updateKPIs() {
    const items = store.getAllItems();
    const totalValue = store.getTotalValue();
    const lowStockItems = store.getLowStockItems(5);
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    kpiTotalValue.textContent = formatPeso(totalValue);
    kpiTotalItems.textContent = items.length;
    kpiTotalUnits.textContent = totalUnits;
    kpiLowStock.textContent = lowStockItems.length;
    tabLowStockBadge.textContent = lowStockItems.length;

    if (lowStockItems.length > 0) {
      kpiLowStockLabel.textContent = `${lowStockItems.length} items low in stock`;
      kpiLowStock.style.color = 'var(--destructive)';
    } else {
      kpiLowStockLabel.textContent = 'All products healthy';
      kpiLowStock.style.color = 'inherit';
    }

    const std = items.filter(i => i.type === 'standard').length;
    const per = items.filter(i => i.type === 'perishable').length;
    const fra = items.filter(i => i.type === 'fragile').length;

    kpiStandardCount.textContent = `${std} Standard`;
    kpiPerishableCount.textContent = `${per} Perishable`;
    kpiFragileCount.textContent = `${fra} Fragile`;
  }

  // --- Render Inventory Table ---
  function renderTable() {
    let items = [...store.getAllItems()];

    // Tab filter
    if (currentTab === 'lowstock') {
      items = store.getLowStockItems(5);
    }

    // Type filter
    const selectedType = typeFilter.value;
    if (selectedType !== 'all') {
      items = items.filter(i => i.type === selectedType);
    }

    // Search filter
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      items = items.filter(i =>
        i.id.toLowerCase().includes(query) ||
        i.name.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
      );
    }

    // Sorting
    const sortVal = sortSelect.value;
    items.sort((a, b) => {
      switch (sortVal) {
        case 'id-asc':
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.quantity - b.quantity;
        case 'stock-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    inventoryTableBody.innerHTML = '';

    if (items.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    items.forEach(item => {
      const tr = document.createElement('tr');

      // Type Badge
      let badgeClass = 'badge-standard';
      let typeLabel = 'Standard';
      if (item.type === 'perishable') {
        badgeClass = 'badge-perishable';
        typeLabel = 'Perishable';
      } else if (item.type === 'fragile') {
        badgeClass = 'badge-fragile';
        typeLabel = 'Fragile';
      }

      // Attributes / Status Column
      let statusHtml = '';
      if (item.type === 'perishable') {
        const isExp = item.isExpired ? item.isExpired() : false;
        const dateStr = item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : 'N/A';
        statusHtml = `
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--warning);">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Exp: ${dateStr}</span>
            ${isExp ? '<span class="badge badge-danger">EXPIRED</span>' : ''}
          </div>
        `;
      } else if (item.type === 'fragile') {
        statusHtml = `
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; color: var(--purple-text);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            <span>Handling Fee: +${formatPeso(item.handlingFee || 5)}</span>
          </div>
        `;
      } else {
        statusHtml = `<span style="color: var(--muted-foreground); font-size: 0.8125rem;">Standard Storage</span>`;
      }

      // Low stock pill
      let stockDisplay = `<span class="table-stock">${item.quantity}</span>`;
      if (item.quantity <= 5) {
        stockDisplay += ` <span class="badge badge-danger" style="margin-left: 0.35rem; font-size: 0.6875rem;">Low Stock</span>`;
      }

      tr.innerHTML = `
        <td class="item-id-cell">${escapeHtml(item.id)}</td>
        <td>
          <div class="item-name-cell">${escapeHtml(item.name)}</div>
          <div class="item-cat-sub">${escapeHtml(item.category)}</div>
        </td>
        <td><span class="badge ${badgeClass}">${typeLabel}</span></td>
        <td class="table-price">${formatPeso(item.price)}</td>
        <td>${stockDisplay}</td>
        <td>${statusHtml}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm btnActionCheckout" data-id="${item.id}" title="Calculate Strategy Checkout">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              Buy
            </button>
            <button class="btn btn-outline btn-sm btnActionEdit" data-id="${item.id}" title="Edit product">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
              Edit
            </button>
            <button class="btn btn-outline btn-sm btnActionDelete" data-id="${item.id}" style="color: var(--destructive); border-color: rgba(239, 68, 68, 0.3);" title="Delete item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      `;

      inventoryTableBody.appendChild(tr);
    });

    attachTableEvents();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Attach Table Row Action Handlers ---
  function attachTableEvents() {
    // Checkout click
    document.querySelectorAll('.btnActionCheckout').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openCheckoutFor(id);
      });
    });

    // Edit click
    document.querySelectorAll('.btnActionEdit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete click
    document.querySelectorAll('.btnActionDelete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteModal(id);
      });
    });
  }

  // --- Tab Navigation Controller ---
  function switchTab(tabId) {
    currentTab = tabId;

    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (tabId === 'catalog' || tabId === 'lowstock') {
      filterBar.style.display = 'flex';
      tableSection.style.display = 'block';
      checkoutSection.style.display = 'none';
      architectureSection.style.display = 'none';
      renderTable();
    } else if (tabId === 'checkout') {
      filterBar.style.display = 'none';
      tableSection.style.display = 'none';
      checkoutSection.style.display = 'block';
      architectureSection.style.display = 'none';
      populateCheckoutItems();
      calculateCheckout();
    } else if (tabId === 'architecture') {
      filterBar.style.display = 'none';
      tableSection.style.display = 'none';
      checkoutSection.style.display = 'none';
      architectureSection.style.display = 'block';
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  searchInput.addEventListener('input', renderTable);
  typeFilter.addEventListener('change', renderTable);
  sortSelect.addEventListener('change', renderTable);
  btnClearFilters.addEventListener('click', () => {
    searchInput.value = '';
    typeFilter.value = 'all';
    sortSelect.value = 'id-asc';
    renderTable();
  });

  // --- Modal Open/Close Helpers ---
  function openModal(modalEl) {
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    const firstInput = modalEl.querySelector('input:not([disabled]):not([type="hidden"]), select, button:not(.btnCloseModal)');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.btnCloseModal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dialog-overlay').forEach(closeModal);
    });
  });

  document.querySelectorAll('.dialog-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dialog-overlay.active').forEach(closeModal);
    }
  });

  // --- Modal 1: Add Item via Factory Pattern ---
  btnOpenAddModal.addEventListener('click', () => {
    formAddItem.reset();
    addType.value = 'standard';
    addTypeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'standard'));
    groupExpiry.style.display = 'none';
    groupHandling.style.display = 'none';
    addHandlingFee.value = '5.00';
    // Auto suggest next ID (e.g. A4)
    const items = store.getAllItems();
    document.getElementById('addId').value = `A${items.length + 1}`;
    openModal(modalAddItem);
  });

  addTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      addType.value = type;
      addTypeButtons.forEach(b => b.classList.toggle('active', b === btn));

      if (type === 'perishable') {
        groupExpiry.style.display = 'block';
        groupHandling.style.display = 'none';
        // default 14 days ahead
        const future = new Date();
        future.setDate(future.getDate() + 14);
        addExpiryDate.value = future.toISOString().split('T')[0];
      } else if (type === 'fragile') {
        groupExpiry.style.display = 'none';
        groupHandling.style.display = 'block';
      } else {
        groupExpiry.style.display = 'none';
        groupHandling.style.display = 'none';
      }
    });
  });

  formAddItem.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('addId').value.trim();
    const name = document.getElementById('addName').value.trim();
    const category = document.getElementById('addCategory').value.trim();
    const price = parseFloat(document.getElementById('addPrice').value);
    const quantity = parseInt(document.getElementById('addQuantity').value, 10);
    const type = addType.value;

    if (!id || !name || !category || isNaN(price) || isNaN(quantity)) {
      showToast('Validation Error', 'Please complete all required fields with valid values.', 'error');
      return;
    }

    if (store.findItem(id)) {
      showToast('ID Collision', `An item with ID "${id}" already exists. Use a unique ID.`, 'error');
      return;
    }

    try {
      const itemData = { id, name, category, price, quantity };
      if (type === 'perishable') {
        itemData.expiryDate = addExpiryDate.value || new Date().toISOString();
      } else if (type === 'fragile') {
        itemData.handlingFee = parseFloat(addHandlingFee.value) || 5.00;
      }

      // Factory Pattern Call
      const newItem = ItemFactoryClass.createItem(type, itemData);
      store.addItem(newItem);
      saveToStorage();

      closeModal(modalAddItem);
      updateKPIs();
      renderTable();
      populateCheckoutItems();

      showToast('Item Created', `Successfully added ${name} (${id}) via ItemFactory.`, 'success');
    } catch (err) {
      showToast('Factory Error', err.message, 'error');
    }
  });

  // --- Modal 2: Edit Item ---
  function openEditModal(id) {
    const item = store.findItem(id);
    if (!item) {
      showToast('Not Found', `Item "${id}" could not be located.`, 'error');
      return;
    }

    editId.value = item.id;
    editIdDisplay.value = item.id;
    editName.value = item.name;
    editPrice.value = item.price;
    editQuantity.value = item.quantity;

    openModal(modalEditItem);
  }

  formEditItem.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editId.value;
    const name = editName.value.trim();
    const price = parseFloat(editPrice.value);
    const quantity = parseInt(editQuantity.value, 10);

    if (!name || isNaN(price) || isNaN(quantity)) {
      showToast('Invalid Input', 'Price and quantity must be valid numbers.', 'error');
      return;
    }

    const updated = store.updateItem(id, { name, price, quantity });
    if (updated) {
      saveToStorage();
      closeModal(modalEditItem);
      updateKPIs();
      renderTable();
      populateCheckoutItems();
      showToast('Item Updated', `Changes to "${name}" (${id}) saved.`, 'success');
    } else {
      showToast('Update Failed', `Could not update item "${id}".`, 'error');
    }
  });

  // --- Modal 3: Delete Item ---
  function openDeleteModal(id) {
    const item = store.findItem(id);
    if (!item) return;
    itemPendingDelete = item;
    deleteItemId.textContent = item.id;
    deleteItemName.textContent = item.name;
    openModal(modalDeleteItem);
  }

  btnConfirmDelete.addEventListener('click', () => {
    if (!itemPendingDelete) return;
    const { id, name } = itemPendingDelete;
    const deleted = store.deleteItem(id);
    if (deleted) {
      saveToStorage();
      closeModal(modalDeleteItem);
      updateKPIs();
      renderTable();
      populateCheckoutItems();
      showToast('Item Deleted', `Removed "${name}" (${id}) from inventory.`, 'info');
    }
    itemPendingDelete = null;
  });

  // --- Strategy Pattern Checkout Controller ---
  function populateCheckoutItems(selectedId = null) {
    const items = store.getAllItems();
    checkoutItemSelect.innerHTML = '';

    if (items.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No items in stock';
      checkoutItemSelect.appendChild(opt);
      return;
    }

    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} · ${formatPeso(item.price)} (${item.quantity} in stock)`;
      if (selectedId && item.id === selectedId) {
        opt.selected = true;
      }
      checkoutItemSelect.appendChild(opt);
    });

    updateCheckoutStockHint();
  }

  function updateCheckoutStockHint() {
    const id = checkoutItemSelect.value;
    const item = store.findItem(id);
    if (item) {
      checkoutItemStockHint.textContent = `Available: ${item.quantity} units (${item.category})`;
      checkoutQuantityInput.max = item.quantity;
      if (item.quantity === 0) {
        checkoutQuantityInput.value = 0;
        checkoutQuantityHint.textContent = 'Out of stock';
        checkoutQuantityHint.style.color = 'var(--destructive)';
      } else {
        if (parseInt(checkoutQuantityInput.value, 10) <= 0) checkoutQuantityInput.value = 1;
        checkoutQuantityHint.textContent = `Max: ${item.quantity} units`;
        checkoutQuantityHint.style.color = 'var(--muted-foreground)';
      }
    } else {
      checkoutItemStockHint.textContent = 'No item selected';
    }
  }

  function openCheckoutFor(id) {
    switchTab('checkout');
    populateCheckoutItems(id);
    calculateCheckout();
  }

  checkoutItemSelect.addEventListener('change', () => {
    updateCheckoutStockHint();
    calculateCheckout();
  });

  checkoutQuantityInput.addEventListener('input', calculateCheckout);

  // Strategy Card Selection
  const strategyCards = [cardStrategyRegular, cardStrategyBulk, cardStrategyMember];
  strategyCards.forEach(card => {
    card.addEventListener('click', () => {
      strategyCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      calculateCheckout();
    });
  });

  function getSelectedStrategy() {
    const checked = document.querySelector('input[name="checkoutStrategy"]:checked');
    return checked ? checked.value : 'regular';
  }

  function calculateCheckout() {
    const itemId = checkoutItemSelect.value;
    const item = store.findItem(itemId);
    const quantity = parseInt(checkoutQuantityInput.value, 10) || 0;
    const strategyType = getSelectedStrategy();

    if (!item || quantity <= 0) {
      receiptItemName.textContent = item ? item.name : '-';
      receiptUnitPrice.textContent = item ? formatPeso(item.price) : '₱0.00';
      receiptQty.textContent = quantity;
      receiptSubtotal.textContent = '₱0.00';
      receiptDiscountRow.style.display = 'none';
      receiptHandlingRow.style.display = 'none';
      receiptFinalTotal.textContent = '₱0.00';
      return;
    }

    // Prepare Strategy Pattern
    let strategy;
    let strategyBadgeText = 'Regular';

    if (strategyType === 'bulk') {
      strategy = new BulkPricingClass();
      strategyBadgeText = 'Bulk (-10%)';
    } else if (strategyType === 'member') {
      strategy = new MemberPricingClass();
      strategyBadgeText = 'Member (-15%)';
    } else {
      strategy = new RegularPricingClass();
      strategyBadgeText = 'Regular';
    }

    const context = new PricingContextClass(strategy);
    const baseSubtotal = item.price * quantity;
    const discountedTotal = context.calculateTotal(item.price, quantity);
    const discountAmount = baseSubtotal - discountedTotal;

    receiptStrategyBadge.textContent = strategyBadgeText;
    receiptItemName.textContent = item.name;
    receiptUnitPrice.textContent = formatPeso(item.price);
    receiptQty.textContent = quantity;
    receiptSubtotal.textContent = formatPeso(baseSubtotal);

    if (discountAmount > 0.001) {
      receiptDiscountRow.style.display = 'flex';
      receiptDiscountVal.textContent = `-${formatPeso(discountAmount)}`;
    } else {
      receiptDiscountRow.style.display = 'none';
    }

    let finalTotal = discountedTotal;

    // Additional handling fee if fragile
    if (item.type === 'fragile' && item.handlingFee) {
      receiptHandlingRow.style.display = 'flex';
      receiptHandlingVal.textContent = `+${formatPeso(item.handlingFee)}`;
      finalTotal += item.handlingFee;
    } else {
      receiptHandlingRow.style.display = 'none';
    }

    receiptFinalTotal.textContent = formatPeso(finalTotal);
  }

  // Process Checkout & Deduct Stock
  btnProcessCheckout.addEventListener('click', () => {
    const itemId = checkoutItemSelect.value;
    const item = store.findItem(itemId);
    const quantity = parseInt(checkoutQuantityInput.value, 10) || 0;

    if (!item) {
      showToast('Error', 'Select an item to checkout.', 'error');
      return;
    }

    if (quantity <= 0) {
      showToast('Invalid Quantity', 'Enter at least 1 unit.', 'error');
      return;
    }

    if (quantity > item.quantity) {
      showToast('Insufficient Stock', `Only ${item.quantity} units available.`, 'error');
      return;
    }

    // Deduct stock
    const newQuantity = item.quantity - quantity;
    store.updateItem(itemId, { quantity: newQuantity });
    saveToStorage();

    updateKPIs();
    renderTable();
    populateCheckoutItems(itemId);
    calculateCheckout();

    showToast(
      'Order Completed',
      `Purchased ${quantity}× ${item.name} for ${receiptFinalTotal.textContent}.`,
      'success'
    );

    if (newQuantity <= 5) {
      setTimeout(() => {
        showToast('Low Stock', `${item.name} has ${newQuantity} units left.`, 'warning');
      }, 400);
    }
  });

  // --- Reset Sample Data ---
  btnResetSeed.addEventListener('click', () => {
    if (confirm('Reset inventory back to sample seed data (Wireless Mouse, Fresh Milk, Ceramic Mug)?')) {
      seedDefaultData();
      saveToStorage();
      updateKPIs();
      renderTable();
      populateCheckoutItems();
      calculateCheckout();
      showToast('Reset Complete', 'Loaded sample items into inventory.', 'info');
    }
  });

  // --- Bootstrapping ---
  initTheme();
  loadFromStorage();
  updateKPIs();
  renderTable();
  populateCheckoutItems();
  calculateCheckout();

})();
