import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Checkout from '../components/Checkout.vue';
import { useCartStore } from '../stores/cart';

describe('Checkout digital', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('não solicita endereço, frete ou dados de cartão', () => {
    const wrapper = mount(Checkout);
    expect(wrapper.text()).not.toContain('Endereço');
    expect(wrapper.text()).not.toContain('Frete');
    expect(wrapper.findAll('input')).toHaveLength(0);
  });

  it('informa Mercado Pago e recálculo no servidor', () => {
    const wrapper = mount(Checkout);
    expect(wrapper.text()).toContain('Mercado Pago');
    expect(wrapper.text()).toContain('recalculado pelo servidor');
  });

  it('desabilita pagamento com carrinho vazio', () => {
    const wrapper = mount(Checkout);
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
  });

  it('emite somente itens locais ao pagar', async () => {
    const cart = useCartStore();
    cart.addItem({ id: 7, title: 'Pack', price: 100, discount: 10 });
    const wrapper = mount(Checkout);
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('submit')[0][0]).toEqual({ items: cart.items });
  });
});
