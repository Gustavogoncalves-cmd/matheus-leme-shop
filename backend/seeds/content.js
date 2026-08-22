#!/usr/bin/env node
/**
 * Seed the content table with the copy currently hardcoded in the frontend
 * components. Safe to re-run: existing keys are left untouched, so the owner's
 * edits in the admin panel are never reverted by a redeploy.
 *
 * Usage: npm run seed:content
 */
require('dotenv').config();
const pool = require('../src/config/database');
const Content = require('../src/models/Content');

const CONTENT = [
  // Hero (frontend/src/components/HeroBar.vue)
  { key: 'hero_badge', section: 'hero', label: 'Selo acima do titulo', value: 'Exclusivo para Streamers' },
  { key: 'hero_title', section: 'hero', label: 'Titulo principal', value: 'Matheus Leme' },
  {
    key: 'hero_subtitle',
    section: 'hero',
    label: 'Subtitulo',
    value:
      'Eleve as suas transmissões: combos completos ou peças avulsas de identidade visual, cenas OBS, painéis e alertas animados. Entrega rápida via WhatsApp.',
  },
  { key: 'hero_cta_primary', section: 'hero', label: 'Botao principal', value: 'Ver Catálogo' },
  { key: 'hero_cta_secondary', section: 'hero', label: 'Botao secundario', value: 'Ver Portfólio' },

  // Portfolio (frontend/src/components/PortfolioGridSection.vue)
  { key: 'portfolio_title', section: 'portfolio', label: 'Titulo', value: 'Nosso Portfólio' },
  {
    key: 'portfolio_subtitle',
    section: 'portfolio',
    label: 'Subtitulo',
    value:
      'Trabalhos reais de edição de vídeo e identidade visual entregues para canais, marcas e organizações.',
  },
  {
    key: 'portfolio_cta_text',
    section: 'portfolio',
    label: 'Texto da chamada final',
    value: 'Fale com a gente e leve sua identidade visual ou edição de vídeo para o próximo nível',
  },

  // Testimonials (frontend/src/components/TestimonialsSectionNew.vue)
  { key: 'testimonials_title', section: 'testimonials', label: 'Titulo', value: 'Opinião de Quem Comprou' },
  {
    key: 'testimonials_subtitle',
    section: 'testimonials',
    label: 'Subtitulo',
    value: 'Avaliações reais de quem já fechou trabalho com o Matheus',
  },
  {
    key: 'testimonials_cta_title',
    section: 'testimonials',
    label: 'Titulo da chamada final',
    value: 'Pronto para Transformar seu Stream?',
  },
  {
    key: 'testimonials_cta_text',
    section: 'testimonials',
    label: 'Texto da chamada final',
    value: 'Junte-se aos streamers que já estão elevando seu setup com nossos streampacks',
  },

  // Shop CTA (frontend/src/pages/ShopPage.vue)
  {
    key: 'cta_title',
    section: 'cta',
    label: 'Titulo (use *asteriscos* para destacar em neon)',
    value: 'Pronto para elevar sua *live*?',
  },
  {
    key: 'cta_subtitle',
    section: 'cta',
    label: 'Subtitulo',
    value: 'Escolha seu combo ou monte seu setup com peças avulsas',
  },

  // Footer (frontend/src/pages/ShopPage.vue)
  { key: 'footer_brand', section: 'footer', label: 'Marca', value: 'Matheus Leme' },
  {
    key: 'footer_tagline',
    section: 'footer',
    label: 'Descricao',
    value: 'Loja de Streampacks Premium — Design e Motion para Streamers',
  },
  {
    key: 'footer_contact',
    section: 'footer',
    label: 'Contato',
    value: 'Pedidos e dúvidas: contato@matheusleme.com.br | WhatsApp: +55 11 95186-5795',
  },
  {
    key: 'footer_copyright',
    section: 'footer',
    label: 'Direitos autorais',
    value: '© 2026 Matheus Leme. Todos os direitos reservados.',
  },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const entry of CONTENT) {
    const created = await Content.insertIfMissing({ type: 'text', ...entry });
    if (created) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`Content seed done: ${inserted} inserted, ${skipped} already present.`);
}

main()
  .catch((err) => {
    console.error('Content seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
