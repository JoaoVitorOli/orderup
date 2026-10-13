import { randomInt } from 'node:crypto';

const ALPHABET =
  'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const SHORT_CODE_LENGTH = 6;

export function generateOrderCode() {
  let id = '';

  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    const randomIndex = randomInt(0, ALPHABET.length);
    id += ALPHABET[randomIndex];
  }

  return id;
}