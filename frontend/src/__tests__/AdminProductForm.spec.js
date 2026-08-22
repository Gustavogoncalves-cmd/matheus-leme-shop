import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminProductForm from '../components/AdminProductForm.vue';

describe('AdminProductForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(AdminProductForm, {
      props: {
        darkMode: false,
      },
    });
  });

  it('renders form for creating new product', () => {
    const heading = wrapper.find('h2');
    expect(heading.text()).toContain('Novo Produto');
  });

  it('renders form with title input', () => {
    const titleInput = wrapper.find('input[type="text"]');
    expect(titleInput.exists()).toBe(true);
  });

  it('renders short description textarea', () => {
    const textareas = wrapper.findAll('textarea');
    expect(textareas.length).toBeGreaterThanOrEqual(1);
  });

  it('renders price input field', () => {
    const inputs = wrapper.findAll('input[type="number"]');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('validates title field - requires minimum length', async () => {
    const form = wrapper.find('form');
    const titleInput = wrapper.find('input[type="text"]');

    // Set invalid title (less than 3 characters)
    await titleInput.setValue('ab');

    // Submit form
    await form.trigger('submit');

    // Check error message
    expect(wrapper.text()).toContain('Título deve ter pelo menos 3 caracteres');
  });

  it('validates price field - requires positive value', async () => {
    const form = wrapper.find('form');
    const titleInput = wrapper.find('input[type="text"]');
    const priceInputs = wrapper.findAll('input[type="number"]');
    const priceInput = priceInputs[0];

    // Set valid title
    await titleInput.setValue('Valid Title');

    // Set invalid price
    await priceInput.setValue(0);

    // Submit form
    await form.trigger('submit');

    // Check error message
    expect(wrapper.text()).toContain('Preço deve ser maior que zero');
  });

  it('emits submit event with form data', async () => {
    const form = wrapper.find('form');
    const titleInput = wrapper.find('input[type="text"]');
    const priceInputs = wrapper.findAll('input[type="number"]');
    const priceInput = priceInputs[0];

    // Fill form with valid data
    await titleInput.setValue('Test Product');
    await priceInput.setValue(99.99);

    // Submit form
    await form.trigger('submit');

    // Check if submit event was emitted
    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('submit button has correct text when not loading', () => {
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.text()).toContain('Criar');
  });

  it('renders category dropdown', () => {
    const select = wrapper.find('select');
    expect(select.exists()).toBe(true);
    expect(wrapper.text()).toContain('Individual');
    expect(wrapper.text()).toContain('Pacote');
  });

  it('renders featured and available checkboxes', () => {
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Cancelar'));
    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('shows edit form when product prop is provided', async () => {
    const mockProduct = {
      title: 'Existing Product',
      shortDescription: 'Short desc',
      description: 'Long description',
      price: 99.99,
      discount: 10,
      category: 'individual',
      featured: true,
      available: true,
    };

    const editWrapper = mount(AdminProductForm, {
      props: {
        darkMode: false,
        product: mockProduct,
      },
    });

    const heading = editWrapper.find('h2');
    expect(heading.text()).toContain('Editar Produto');
  });
});
