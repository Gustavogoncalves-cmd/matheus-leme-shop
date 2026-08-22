/**
 * Split editable copy into plain and accented segments.
 *
 * Headlines in the neon design highlight one word (e.g. "elevar sua **live**?").
 * Once that copy is owner-editable it can no longer be hardcoded markup, and
 * rendering stored HTML with v-html would turn the admin panel into a stored-XSS
 * vector. So the stored value uses a tiny marker instead - `*word*` - and this
 * returns plain data that the template renders as ordinary text nodes.
 *
 *   accentText('elevar sua *live*?')
 *   // => [{ text: 'elevar sua ', accent: false },
 *   //     { text: 'live',        accent: true  },
 *   //     { text: '?',           accent: false }]
 *
 * Unmatched or absent markers simply render as-is, so a value the owner typed
 * without knowing the convention still displays correctly.
 */
export function accentText(value) {
  const source = String(value ?? '');
  const segments = [];
  const pattern = /\*([^*]+)\*/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > cursor) {
      segments.push({ text: source.slice(cursor, match.index), accent: false });
    }
    segments.push({ text: match[1], accent: true });
    cursor = match.index + match[0].length;
  }

  if (cursor < source.length) {
    segments.push({ text: source.slice(cursor), accent: false });
  }

  return segments.length ? segments : [{ text: source, accent: false }];
}
