import { animate } from 'motion-v';

/**
 * "Voo para o carrinho": um icone generico sai do botao clicado e voa em arco
 * ate o icone da sacola no header, que treme ao receber o impacto.
 *
 * Reescricao Vue da demo AddToBasket (React/motion). A engine e a mesma -
 * motion-v reexporta framer-motion/dom, entao `animate` e `arc` tem o
 * comportamento identico ao original.
 *
 * Uso:  const { flyToCart } = useCartFly();
 *       async function onAdd() { await addItem(...); flyToCart(event); }
 */

const FLY_MS = 450;
const SHAKE_MS = 500;

export function useCartFly() {
  /**
   * @param {MouseEvent|undefined} clickEvent - evento do botao clicado; de onde
   *        o clone parte. Omitido: parte do centro da tela.
   */
  async function flyToCart(clickEvent) {
    const target = document.querySelector('[data-testid="cart-rocket-target"]');
    if (!target) return;

    const to = target.getBoundingClientRect();
    const from = clickEvent?.currentTarget?.getBoundingClientRect?.()
      ?? { left: innerWidth / 2 - 20, top: innerHeight / 2 - 20, width: 40, height: 40 };

    // Clone fixo sobre a pagina: animar o proprio card exigiria medir e
    // restaurar transformes dele; o clone morre sozinho no fim.
    const ghost = document.createElement('div');
    ghost.textContent = '🛒';
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${from.left + from.width / 2 - 22}px`,
      top: `${from.top + from.height / 2 - 22}px`,
      width: '44px',
      height: '44px',
      fontSize: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
      pointerEvents: 'none',
      willChange: 'transform',
    });
    document.body.appendChild(ghost);

    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);

    try {
      await animate(
        ghost,
        { x: dx, y: dy, scale: [1, 1.15, 0.35], opacity: [1, 1, 0.4] },
        {
          duration: FLY_MS / 1000,
          ease: [0.74, 0.18, 0.93, 0.69],
        },
      );
    } finally {
      ghost.remove();
    }

    // Impacto: a sacola balanca e volta ao lugar com spring.
    const link = target.closest('[data-testid="cart-link"]') ?? target;
    animate(
      link,
      { rotate: [0, -12, 10, -6, 0], scale: [1, 1.25, 1] },
      { duration: SHAKE_MS / 1000, ease: 'easeOut' },
    );
  }

  return { flyToCart };
}
