import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProductCard from '../components/ProductCard.vue';

describe('ProductCard.vue', () => {
  const mockProduct = {
    id: 1,
    title: 'Test Product',
    headerTitle: 'Test Header',
    category: 'individual',
    type: 'asset',
    description: 'Test Description',
    shortDescription: 'Short desc',
    price: 99.99,
    discount: 10,
    priceOriginal: 111.10,
    featured: false,
    available: true,
    themeColor: '#6366f1',
    thumbnail: 'https://example.com/thumb.jpg',
    images: ['https://example.com/img1.jpg'],
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    previews: [],
  };

  it('renders product title', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Test Product');
  });

  it('applies dark mode styles when darkMode prop is true', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: true,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const content = wrapper.find('.p-6');
    expect(content.classes()).toContain('bg-slate-900');
  });

  it('applies light mode styles when darkMode prop is false', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const content = wrapper.find('.p-6');
    expect(content.classes()).toContain('bg-white');
  });

  it('displays discount badge when discount is provided', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('-10% OFF');
  });

  it('does not display discount badge when discount is not provided', () => {
    const productNoDiscount = { ...mockProduct, discount: null };
    const wrapper = mount(ProductCard, {
      props: {
        product: productNoDiscount,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).not.toContain('OFF');
  });

  it('displays ESGOTADO when product is not available', () => {
    const unavailableProduct = { ...mockProduct, available: false };
    const wrapper = mount(ProductCard, {
      props: {
        product: unavailableProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('ESGOTADO');
  });

  it('emits view event when details button is clicked', async () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const viewButton = wrapper.find('button:first-of-type');
    await viewButton.trigger('click');

    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')).toHaveLength(1);
  });

  it('renders short description', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Short desc');
  });

  it('calculates price original correctly when priceOriginal is provided', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('111.10');
  });

  it('uses product.price as priceOriginal when priceOriginal is not provided', () => {
    const productNoOriginal = { ...mockProduct, priceOriginal: undefined };
    const wrapper = mount(ProductCard, {
      props: {
        product: productNoOriginal,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    // priceOriginal should fallback to product.price (99.99)
    expect(wrapper.text()).toContain('99.99');
  });

  it('generates correct WhatsApp link', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const whatsappLink = wrapper.find('a');
    const href = whatsappLink.attributes('href');
    expect(href).toContain('wa.me');
    expect(href).toContain(encodeURIComponent('Test Product'));
    expect(href).toContain('5511951865795');
  });

  it('shows combo badge for pacote category', () => {
    const pacoteProduct = { ...mockProduct, category: 'pacote' };
    const wrapper = mount(ProductCard, {
      props: {
        product: pacoteProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Combo');
  });

  it('shows individual badge for individual category', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Individual');
  });

  it('displays featured badge when product is featured and available', () => {
    const featuredProduct = { ...mockProduct, featured: true, available: true };
    const wrapper = mount(ProductCard, {
      props: {
        product: featuredProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('POPULAR');
  });

  it('disables WhatsApp button when product is not available', () => {
    const unavailableProduct = { ...mockProduct, available: false };
    const wrapper = mount(ProductCard, {
      props: {
        product: unavailableProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    const shoppingButton = buttons[buttons.length - 1];
    expect(shoppingButton.attributes('disabled')).toBeDefined();
  });

  it('renders featured badge border when product is featured', () => {
    const featuredProduct = { ...mockProduct, featured: true };
    const wrapper = mount(ProductCard, {
      props: {
        product: featuredProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const outerDiv = wrapper.find('[class*="from-brand-500"]');
    expect(outerDiv.exists()).toBe(true);
    expect(outerDiv.classes()).toContain('bg-gradient-to-r');
  });

  it('WhatsApp link includes correct phone number', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const whatsappLink = wrapper.find('a');
    const href = whatsappLink.attributes('href');
    expect(href).toContain('5511951865795');
  });

  it('WhatsApp link opens in new tab', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const whatsappLink = wrapper.find('a');
    expect(whatsappLink.attributes('target')).toBe('_blank');
  });

  it('WhatsApp message includes product title', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const whatsappLink = wrapper.find('a');
    const href = whatsappLink.attributes('href');
    expect(href).toContain(encodeURIComponent('Test Product'));
  });

  it('displays more features count when features exceed 3', () => {
    const manyFeaturesProduct = {
      ...mockProduct,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5']
    };
    const wrapper = mount(ProductCard, {
      props: {
        product: manyFeaturesProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    expect(wrapper.text()).toContain('+2 itens');
  });

  it('displays correct gradient background for featured products', () => {
    const featuredProduct = { ...mockProduct, featured: true };
    const wrapper = mount(ProductCard, {
      props: {
        product: featuredProduct,
        darkMode: false,
      },
      global: {
        stubs: {
          Eye: true,
          ShoppingBag: true,
          Star: true,
        },
      },
    });

    const wrapper_div = wrapper.find('div');
    expect(wrapper_div.classes()).toContain('bg-gradient-to-r');
  });
});
