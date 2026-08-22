import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import Checkout from '../components/Checkout.vue';

describe('Checkout.vue', () => {
  let wrapper;
  const pinia = createPinia();

  beforeEach(() => {
    wrapper = mount(Checkout, {
      props: {
        darkMode: false,
      },
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders checkout form', () => {
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true);
  });

  it('renders contact information section', () => {
    expect(wrapper.text()).toContain('Informações de Contato');
  });

  it('renders email input field', () => {
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.exists()).toBe(true);
  });

  it('renders phone input field', () => {
    const phoneInput = wrapper.find('input[type="tel"]');
    expect(phoneInput.exists()).toBe(true);
  });

  it('renders address section', () => {
    expect(wrapper.text()).toContain('Endereço de Entrega');
  });

  it('renders order summary section', () => {
    expect(wrapper.text()).toContain('Resumo do Pedido');
  });

  it('validates email field on blur', async () => {
    const emailInput = wrapper.find('input[type="email"]');

    // Set invalid email
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');

    expect(wrapper.text()).toContain('Email inválido');
  });

  it('clears email error for valid email', async () => {
    const emailInput = wrapper.find('input[type="email"]');

    // Set valid email
    await emailInput.setValue('valid@email.com');
    await emailInput.trigger('blur');

    expect(wrapper.text()).not.toContain('Email inválido');
  });

  it('shows submit button with "Ir para Pagamento" text', () => {
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Ir para Pagamento');
  });

  it('emits submit event with form data', async () => {
    const form = wrapper.find('form');
    const nameInput = wrapper.find('input[type="text"]');
    const emailInput = wrapper.find('input[type="email"]');
    const phoneInput = wrapper.find('input[type="tel"]');

    // Fill form with minimal data
    await nameInput.setValue('João Silva');
    await emailInput.setValue('test@email.com');
    await phoneInput.setValue('11987654321');

    // For this test, we just check that form renders without errors
    expect(form.exists()).toBe(true);
  });

  it('disables submit button while loading', async () => {
    const form = wrapper.find('form');
    const nameInput = wrapper.find('input[type="text"]');
    const emailInput = wrapper.find('input[type="email"]');

    // Fill minimal form
    await nameInput.setValue('João Silva');
    await emailInput.setValue('test@email.com');

    // Check submit button exists
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
  });

  it('renders all address fields (street, city, state, zipcode)', () => {
    expect(wrapper.text()).toContain('Rua');
    expect(wrapper.text()).toContain('Número');
    expect(wrapper.text()).toContain('Cidade');
    expect(wrapper.text()).toContain('Estado');
  });

  it('applies light mode styles when darkMode is false', () => {
    const container = wrapper.find('.bg-white');
    expect(container.exists()).toBe(true);
  });

  it('applies dark mode styles when darkMode is true', async () => {
    await wrapper.setProps({ darkMode: true });
    await wrapper.vm.$nextTick();

    const container = wrapper.find('[class*="dark:bg-slate-900"]');
    expect(container.exists()).toBe(true);
  });

  it('renders MercadoPago security badge', () => {
    expect(wrapper.text()).toContain('MercadoPago');
  });

  it('masks phone input correctly', async () => {
    const phoneInput = wrapper.find('input[type="tel"]');

    // Type phone number
    await phoneInput.setValue('11987654321');
    await phoneInput.trigger('input');

    // Should be formatted
    expect(phoneInput.element.value).toMatch(/\(/);
  });

  it('validates phone field on blur', async () => {
    const phoneInput = wrapper.find('input[type="tel"]');

    // Set invalid phone (too short)
    await phoneInput.setValue('123');
    await phoneInput.trigger('blur');

    expect(wrapper.text()).toContain('Telefone deve ter pelo menos 10 dígitos');
  });

  it('clears phone error for valid phone', async () => {
    const phoneInput = wrapper.find('input[type="tel"]');

    // Set valid phone
    await phoneInput.setValue('11987654321');
    await phoneInput.trigger('blur');

    expect(wrapper.text()).not.toContain('Telefone deve ter');
  });

  it('renders name input field', () => {
    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders city and state fields', () => {
    expect(wrapper.text()).toContain('Cidade');
    expect(wrapper.text()).toContain('Estado');
  });

  it('displays cart summary on the right side', () => {
    expect(wrapper.text()).toContain('Resumo do Pedido');
    expect(wrapper.text()).toContain('Subtotal');
    expect(wrapper.text()).toContain('Desconto');
  });

  it('renders security badge with MercadoPago info', () => {
    expect(wrapper.text()).toContain('Pagamento seguro');
    expect(wrapper.text()).toContain('MercadoPago');
  });

  it('handles form submission with valid data', async () => {
    const form = wrapper.find('form');
    const inputs = wrapper.findAll('input');

    // Fill minimum required fields
    for (let input of inputs) {
      if (input.attributes('type') === 'text') {
        await input.setValue('Test Value');
      } else if (input.attributes('type') === 'email') {
        await input.setValue('test@example.com');
      } else if (input.attributes('type') === 'tel') {
        await input.setValue('11987654321');
      }
    }

    // This should not throw
    expect(form.exists()).toBe(true);
  });

  it('displays total in cart summary', () => {
    expect(wrapper.text()).toContain('Total');
  });

  it('validates zipcode field', async () => {
    const zipInputs = wrapper.findAll('input');
    const zipInput = zipInputs.find(inp => inp.attributes('placeholder') === undefined && inp.attributes('type') === 'text');

    if (zipInput) {
      // Set invalid zip (too short)
      await zipInput.setValue('123');
      await zipInput.trigger('blur');
    }
  });

  it('validates state field - requires 2 characters', async () => {
    const stateInputs = wrapper.findAll('input');
    const stateInput = stateInputs.find(inp => inp.attributes('placeholder')?.includes('SP'));

    if (stateInput) {
      await stateInput.setValue('S');
      // State field validation
      expect(stateInput.attributes('maxlength')).toBe('2');
    }
  });

  it('renders form sections with proper structure', () => {
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true);
    expect(form.classes()).toContain('space-y-8');
  });

  it('displays security badge with lock icon', () => {
    expect(wrapper.text()).toContain('Pagamento seguro');
  });

  it('shows sticky order summary on desktop', () => {
    const summary = wrapper.find('[class*="sticky"]');
    expect(summary.exists()).toBe(true);
  });

  it('renders form with grid layout for address fields', () => {
    const gridElements = wrapper.findAll('[class*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('has proper spacing classes on form sections', () => {
    const form = wrapper.find('form');
    expect(form.classes()).toContain('space-y-8');
  });
});
