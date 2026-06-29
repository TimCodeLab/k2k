import { describe, it, expect } from 'vitest';
import { formatKHR, khqrImageUrl } from '../utils/format';
import { PROVINCES, CATEGORIES, categoryEmoji } from '../utils/constants';

describe('formatKHR', () => {
  it('formats with thousands separators and the riel symbol', () => {
    expect(formatKHR(2800)).toBe('2,800 ៛');
    expect(formatKHR(300000)).toBe('300,000 ៛');
  });
  it('rounds fractional amounts', () => {
    expect(formatKHR(1499.6)).toBe('1,500 ៛');
  });
});

describe('khqrImageUrl', () => {
  it('encodes the payload into the QR service URL', () => {
    expect(khqrImageUrl('ABC 123')).toContain('data=ABC%20123');
  });
});

describe('constants', () => {
  it('has 25 Cambodian provinces and a known set of categories', () => {
    expect(PROVINCES).toHaveLength(25);
    expect(CATEGORIES).toContain('Spices/Pepper');
  });
  it('maps every category to an emoji', () => {
    for (const c of CATEGORIES) expect(categoryEmoji[c]).toBeTruthy();
  });
});
