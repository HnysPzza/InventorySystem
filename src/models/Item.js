class Item {
  constructor(id, name, category, price, quantity) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.quantity = quantity;
  }

  getInfo() {
    return `${this.name} (${this.category}) - ₱${this.price} | Stock: ${this.quantity}`;
  }
}

class StandardItem extends Item {
  constructor(id, name, category, price, quantity) {
    super(id, name, category, price, quantity);
    this.type = 'standard';
  }
}

class PerishableItem extends Item {
  constructor(id, name, category, price, quantity, expiryDate) {
    super(id, name, category, price, quantity);
    this.type = 'perishable';
    this.expiryDate = new Date(expiryDate);
  }

  isExpired() {
    return new Date() > this.expiryDate;
  }
}

class FragileItem extends Item {
  constructor(id, name, category, price, quantity, handlingFee = 5) {
    super(id, name, category, price, quantity);
    this.type = 'fragile';
    this.handlingFee = handlingFee;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Item,
    StandardItem,
    PerishableItem,
    FragileItem
  };
} else if (typeof window !== 'undefined') {
  window.Item = Item;
  window.StandardItem = StandardItem;
  window.PerishableItem = PerishableItem;
  window.FragileItem = FragileItem;
}

