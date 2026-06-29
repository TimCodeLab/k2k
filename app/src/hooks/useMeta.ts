import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PROVINCES, CATEGORIES } from '../utils/constants';
import type { Category } from '../types';

export function useMeta() {
  const [provinces, setProvinces] = useState<string[]>(PROVINCES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    api.meta()
      .then((m) => { if (m.provinces?.length) setProvinces(m.provinces); if (m.categories?.length) setCategories(m.categories); })
      .catch(() => { /* keep fallbacks offline */ });
  }, []);

  return { provinces, categories };
}
