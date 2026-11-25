const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function normalizeJoinCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidJoinCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function generateJoinCode(rng: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const idx = Math.floor(rng() * CODE_ALPHABET.length) % CODE_ALPHABET.length;
    out += CODE_ALPHABET[idx];
  }
  return out;
}
