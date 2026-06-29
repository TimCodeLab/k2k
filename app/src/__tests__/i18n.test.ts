import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en';
import km from '../i18n/locales/km';

// Collect every dotted key path in a nested translation object.
function keyPaths(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null ? keyPaths(v, path) : [path];
  });
}

describe('i18n locale parity', () => {
  it('km has exactly the same keys as en', () => {
    const enKeys = keyPaths(en).sort();
    const kmKeys = keyPaths(km as any).sort();
    expect(kmKeys).toEqual(enKeys);
  });

  it('no translation value is empty', () => {
    for (const [locale, obj] of [['en', en], ['km', km]] as const) {
      for (const path of keyPaths(obj as any)) {
        const val = path.split('.').reduce((o: any, k) => o[k], obj as any);
        expect(String(val).trim(), `${locale}:${path}`).not.toBe('');
      }
    }
  });
});
