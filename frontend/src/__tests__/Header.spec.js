import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Header from '../components/Header.vue';
import { createPinia } from 'pinia';

describe('Header.vue', () => {
  let wrapper;
  const pinia = createPinia();

  beforeEach(() => {
    wrapper = mount(Header, {
      props: {
        isDark: false,
      },
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          Moon: true,
          Sun: true,
          ShoppingBag: true,
        },
      },
    });
  });

  it('renders logo image', () => {
    const logo = wrapper.find('img[alt="Matheus Leme"]');
    expect(logo.exists()).toBe(true);
    expect(logo.attributes('src')).toBe('/assets/logos/logo.png');
  });

  it('renders header element with correct structure', () => {
    const header = wrapper.find('header');
    expect(header.exists()).toBe(true);
  });

  it('renders dark mode toggle button', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('emits toggleDarkMode event when dark mode button is clicked', async () => {
    const buttons = wrapper.findAll('button');
    const toggleButton = buttons[0];
    await toggleButton.trigger('click');

    expect(wrapper.emitted('toggleDarkMode')).toBeTruthy();
    expect(wrapper.emitted('toggleDarkMode')).toHaveLength(1);
  });

  it('applies light mode styles when isDark is false', () => {
    const header = wrapper.find('header');
    expect(header.classes()).toContain('bg-white/80');
    expect(header.classes()).toContain('border-slate-200');
  });

  it('applies dark mode styles when isDark is true', async () => {
    await wrapper.setProps({ isDark: true });

    const header = wrapper.find('header');
    expect(header.classes()).toContain('bg-slate-900/95');
    expect(header.classes()).toContain('border-slate-800');
  });

  it('renders multiple RouterLink components', () => {
    const routerLinks = wrapper.findAll('a');
    expect(routerLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('has sticky positioning', () => {
    const header = wrapper.find('header');
    expect(header.classes()).toContain('sticky');
    expect(header.classes()).toContain('top-0');
  });

  it('has proper z-index for sticky header', () => {
    const header = wrapper.find('header');
    expect(header.classes()).toContain('z-40');
  });

  it('renders with transition duration class', () => {
    const header = wrapper.find('header');
    expect(header.classes()).toContain('transition-all');
    expect(header.classes()).toContain('duration-300');
  });
});
