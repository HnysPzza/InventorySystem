// Strategy 1: Regular pricing with no discount
class RegularPricing {
  calculate(price, quantity) {
    return price * quantity;
  }
}

// Strategy 2: 10% discount for orders of 5 or more units
class BulkPricing {
  calculate(price, quantity) {
    const subtotal = price * quantity;
    if (quantity >= 5) {
      return subtotal * 0.9;
    }
    return subtotal;
  }
}

// Strategy 3: Flat 15% discount for members
class MemberPricing {
  calculate(price, quantity) {
    return (price * quantity) * 0.85;
  }
}

// Strategy Pattern Context: delegates calculation to selected strategy
class PricingContext {
  constructor(strategy = new RegularPricing()) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculateTotal(price, quantity) {
    return Number(this.strategy.calculate(price, quantity).toFixed(2));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RegularPricing,
    BulkPricing,
    MemberPricing,
    PricingContext
  };
} else if (typeof window !== 'undefined') {
  window.RegularPricing = RegularPricing;
  window.BulkPricing = BulkPricing;
  window.MemberPricing = MemberPricing;
  window.PricingContext = PricingContext;
}

