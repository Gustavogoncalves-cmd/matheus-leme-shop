import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminOrderList from '../components/AdminOrderList.vue';

describe('AdminOrderList.vue', () => {
  const mockOrders = [
    {
      id: 1,
      customerName: 'João Silva',
      total: 299.99,
      status: 'pending',
      date: '2024-01-15',
    },
    {
      id: 2,
      customerName: 'Maria Santos',
      total: 149.99,
      status: 'shipped',
      date: '2024-01-14',
    },
    {
      id: 3,
      customerName: 'Pedro Oliveira',
      total: 499.99,
      status: 'delivered',
      date: '2024-01-13',
    },
  ];

  let wrapper;

  beforeEach(() => {
    wrapper = mount(AdminOrderList, {
      props: {
        orders: mockOrders,
        darkMode: false,
      },
    });
  });

  it('renders table with order data', () => {
    const table = wrapper.find('table');
    expect(table.exists()).toBe(true);
  });

  it('displays order IDs in table rows', () => {
    expect(wrapper.text()).toContain('#1');
    expect(wrapper.text()).toContain('#2');
    expect(wrapper.text()).toContain('#3');
  });

  it('displays customer names in table', () => {
    expect(wrapper.text()).toContain('João Silva');
    expect(wrapper.text()).toContain('Maria Santos');
    expect(wrapper.text()).toContain('Pedro Oliveira');
  });

  it('displays order totals in table', () => {
    expect(wrapper.text()).toContain('299.99');
    expect(wrapper.text()).toContain('149.99');
    expect(wrapper.text()).toContain('499.99');
  });

  it('renders status filter dropdown', () => {
    const statusSelect = wrapper.findAll('select')[0];
    expect(statusSelect.exists()).toBe(true);
    expect(wrapper.text()).toContain('Pendente');
    expect(wrapper.text()).toContain('Processando');
    expect(wrapper.text()).toContain('Entregue');
  });

  it('filters orders by status', async () => {
    const statusSelect = wrapper.findAll('select')[0];
    await statusSelect.setValue('delivered');

    // Should only show order with status 'delivered'
    expect(wrapper.text()).toContain('Pedro Oliveira');
    expect(wrapper.text()).toContain('Entregue');
  });

  it('renders date filter input', () => {
    const dateInput = wrapper.find('input[type="date"]');
    expect(dateInput.exists()).toBe(true);
  });

  it('emits view event when view button is clicked', async () => {
    const viewButtons = wrapper.findAll('button');
    const firstViewButton = viewButtons[0];

    await firstViewButton.trigger('click');

    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')[0]).toEqual([1]);
  });

  it('applies correct status badge color for pending order', () => {
    expect(wrapper.text()).toContain('Pendente');
  });

  it('applies correct status badge color for shipped order', () => {
    expect(wrapper.text()).toContain('Enviado');
  });

  it('applies correct status badge color for delivered order', () => {
    expect(wrapper.text()).toContain('Entregue');
  });

  it('formats date correctly', () => {
    // Should display dates in Brazilian format
    const dateText = wrapper.text();
    expect(dateText).toContain('2024');
  });

  it('shows empty state message when no orders', async () => {
    const emptyWrapper = mount(AdminOrderList, {
      props: {
        orders: [],
        darkMode: false,
      },
    });

    expect(emptyWrapper.text()).toContain('Nenhum pedido encontrado');
  });

  it('renders order total values correctly', () => {
    expect(wrapper.text()).toContain('299.99');
    expect(wrapper.text()).toContain('149.99');
    expect(wrapper.text()).toContain('499.99');
  });

  it('table has correct headers', () => {
    const headers = wrapper.findAll('th');
    expect(headers.length).toBeGreaterThanOrEqual(5);
  });
});
