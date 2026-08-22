import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../stores/cart';

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock localStorage
    vi.clearAllMocks();
  });

  it('initializes with empty cart', () => {
    const cartStore = useCartStore();
    expect(cartStore.items).toEqual([]);
    expect(cartStore.total).toBe(0);
    expect(cartStore.count).toBe(0);
  });

  it('adds item to cart', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);

    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0].title).toBe('Test Product');
    expect(cartStore.items[0].quantity).toBe(1);
  });

  it('increments quantity when adding existing item', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    cartStore.addItem(product);

    expect(cartStore.items).toHaveLength(1);
    expect(cartStore.items[0].quantity).toBe(2);
  });

  it('removes item from cart', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    expect(cartStore.items).toHaveLength(1);

    cartStore.removeItem(1);
    expect(cartStore.items).toHaveLength(0);
  });

  it('updates item quantity', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    cartStore.updateQuantity(1, 5);

    expect(cartStore.items[0].quantity).toBe(5);
  });

  it('removes item when quantity is set to 0', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    cartStore.updateQuantity(1, 0);

    expect(cartStore.items).toHaveLength(0);
  });

  it('removes item when quantity is negative', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    cartStore.updateQuantity(1, -1);

    expect(cartStore.items).toHaveLength(0);
  });

  it('clears entire cart', () => {
    const cartStore = useCartStore();
    const product1 = {
      id: 1,
      title: 'Product 1',
      price: 100,
      discount: 0,
      thumbnail: 'test1.jpg',
    };
    const product2 = {
      id: 2,
      title: 'Product 2',
      price: 200,
      discount: 0,
      thumbnail: 'test2.jpg',
    };

    cartStore.addItem(product1);
    cartStore.addItem(product2);
    expect(cartStore.items).toHaveLength(2);

    cartStore.clearCart();
    expect(cartStore.items).toHaveLength(0);
    expect(cartStore.total).toBe(0);
  });

  it('calculates total price correctly', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10, // 10% off
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    // Price: 100 * (1 - 0.10) = 90
    expect(cartStore.total).toBe(90);
  });

  it('calculates total with multiple items', () => {
    const cartStore = useCartStore();
    const product1 = {
      id: 1,
      title: 'Product 1',
      price: 100,
      discount: 0,
      thumbnail: 'test1.jpg',
    };
    const product2 = {
      id: 2,
      title: 'Product 2',
      price: 100,
      discount: 10,
      thumbnail: 'test2.jpg',
    };

    cartStore.addItem(product1);
    cartStore.addItem(product2);
    cartStore.updateQuantity(1, 2); // 2 x 100 = 200
    // 1 x 90 (100 - 10%) = 90
    // Total: 200 + 90 = 290
    expect(cartStore.total).toBe(290);
  });

  it('calculates item count correctly', () => {
    const cartStore = useCartStore();
    const product1 = {
      id: 1,
      title: 'Product 1',
      price: 100,
      discount: 0,
      thumbnail: 'test1.jpg',
    };
    const product2 = {
      id: 2,
      title: 'Product 2',
      price: 100,
      discount: 0,
      thumbnail: 'test2.jpg',
    };

    cartStore.addItem(product1);
    cartStore.addItem(product2);
    cartStore.updateQuantity(1, 3);

    // 3 units of product1 + 1 unit of product2 = 4
    expect(cartStore.count).toBe(4);
  });

  it('saves cart to localStorage', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Test Product',
      price: 100,
      discount: 10,
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('updates quantity does nothing for non-existent item', () => {
    const cartStore = useCartStore();

    cartStore.updateQuantity(999, 5);

    expect(cartStore.items).toHaveLength(0);
  });

  it('handles discount calculation in total', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Discounted Product',
      price: 200,
      discount: 20, // 20% off
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);
    // 200 * (1 - 0.20) = 160
    expect(cartStore.total).toBe(160);
  });

  it('calculates total with multiple items and mixed discounts', () => {
    const cartStore = useCartStore();

    const product1 = {
      id: 1,
      title: 'Product 1',
      price: 100,
      discount: 0,
      thumbnail: 'test1.jpg',
    };

    const product2 = {
      id: 2,
      title: 'Product 2',
      price: 100,
      discount: 50, // 50% off
      thumbnail: 'test2.jpg',
    };

    cartStore.addItem(product1);
    cartStore.addItem(product2);

    // Product 1: 100 * 1 = 100
    // Product 2: 100 * (1 - 0.50) = 50
    // Total: 150
    expect(cartStore.total).toBe(150);
  });

  it('initializes cart from localStorage if available', () => {
    const cartStore = useCartStore();
    const mockItems = [
      { id: 1, title: 'Saved Product', price: 50, discount: 0, quantity: 1, thumbnail: 'test.jpg' }
    ];

    localStorage.getItem.mockReturnValue(JSON.stringify(mockItems));

    const newStore = useCartStore();
    newStore.initCart();

    // The store should have called getItem
    expect(localStorage.getItem).toHaveBeenCalled();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid json{');

    const cartStore = useCartStore();
    cartStore.initCart();

    // Should default to empty array on parse error
    expect(cartStore.items).toBeDefined();
  });

  it('gets item count with no items', () => {
    const cartStore = useCartStore();
    expect(cartStore.count).toBe(0);
  });

  it('gets total with no items', () => {
    const cartStore = useCartStore();
    expect(cartStore.total).toBe(0);
  });

  it('handles product without discount field', () => {
    const cartStore = useCartStore();
    const product = {
      id: 1,
      title: 'Product No Discount',
      price: 100,
      // No discount field
      thumbnail: 'test.jpg',
    };

    cartStore.addItem(product);

    // Should use full price: 100 * (1 - undefined/100) = 100
    expect(cartStore.total).toBe(100);
  });
});
