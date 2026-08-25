import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminOrderList from '../components/AdminOrderList.vue';

const orders = [
  { id: 1, user_id: 10, customer_name: 'João', customer_email: 'joao@test.com', total_price: 299.99, status: 'pending_payment', created_at: '2024-01-15T12:00:00Z' },
  { id: 2, user_id: 11, customer_name: 'Maria', customer_email: 'maria@test.com', total_price: 149.99, status: 'paid', created_at: '2024-01-14T12:00:00Z' },
];

describe('AdminOrderList digital', () => {
  let wrapper;
  beforeEach(() => { wrapper = mount(AdminOrderList, { props: { orders } }); });
  it('renderiza payload real do backend', () => {
    expect(wrapper.text()).toContain('João'); expect(wrapper.text()).toContain('R$'); expect(wrapper.text()).toContain('Aguardando pagamento'); expect(wrapper.text()).toContain('Pago');
  });
  it('filtra pelos status digitais', async () => {
    await wrapper.get('select').setValue('paid');
    expect(wrapper.text()).toContain('Maria'); expect(wrapper.text()).not.toContain('João');
  });
  it('emite pedido selecionado', async () => {
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('view')[0]).toEqual([1]);
  });
  it('mostra estado vazio', () => {
    expect(mount(AdminOrderList, { props: { orders: [] } }).text()).toContain('Nenhum pedido');
  });
});
