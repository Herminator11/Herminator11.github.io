/** Motion tokens from tokens.css, read at call time so JS timings follow the CSS. */
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

export const dur = (name: 'dur-1' | 'dur-2' | 'dur-3') => parseFloat(token(name)) || 0;
export const ease = (name: 'ease-out' | 'ease-in-out' = 'ease-out') => token(name) || 'ease';
