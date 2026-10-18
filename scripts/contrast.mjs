// Verifies WCAG contrast for text token pairs in both themes. Exit 1 on failure.
const themes = {
  light: { bg: '#f4f4f1', surface: '#fbfbf9', ink: '#14130f', muted: '#5c5a53', accent: '#c9301a' },
  dark: { bg: '#111110', surface: '#1a1a18', ink: '#edece7', muted: '#a2a09a', accent: '#ff6a4a' },
};
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
let fail = false;
for (const [name, t] of Object.entries(themes)) {
  for (const fg of ['ink', 'muted', 'accent']) for (const bg of ['bg', 'surface']) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= 4.5;
    if (!ok) fail = true;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${fg} on ${bg}: ${r.toFixed(2)}`);
  }
}
process.exit(fail ? 1 : 0);
