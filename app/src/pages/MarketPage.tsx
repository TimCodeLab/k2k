import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardContent, IonSelect, IonSelectOption, IonChip,
  IonSpinner, IonRefresher, IonRefresherContent, IonButton, IonBadge, IonSearchbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useMeta } from '../hooks/useMeta';
import { formatKHR, categoryEmoji } from '../utils';
import type { Crop } from '../types';
import LanguageToggle from '../components/LanguageToggle';

const MarketPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { provinces, categories } = useMeta();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [sort, setSort] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const { crops } = await api.getCrops({ category, province, q, sort });
      setCrops(crops);
    } catch { setCrops([]); }
    finally { setLoading(false); }
  };

  // Debounce search; refetch immediately on filter/sort change.
  useEffect(() => {
    const id = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(id);
    /* eslint-disable-next-line */
  }, [category, province, q, sort]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar">
          <IonTitle>
            🌾 {t('appName')}
            <div className="brand-sub">{t('slogan')}</div>
          </IonTitle>
          <IonButtons slot="end"><LanguageToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().then(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        <p className="section-sub">{t('market.subtitle')}</p>

        <IonSearchbar
          value={q} debounce={0} placeholder={t('market.searchPlaceholder')}
          onIonInput={(e) => setQ(e.detail.value ?? '')} style={{ paddingTop: 0 }} />

        <div style={{ display: 'flex', gap: 8, padding: '0 12px', alignItems: 'flex-end' }}>
          <IonSelect
            label={t('market.sortLabel')} labelPlacement="stacked" interface="action-sheet"
            value={sort} placeholder={t('market.sortNewest')} style={{ flex: 1 }}
            onIonChange={(e) => setSort(e.detail.value)}>
            <IonSelectOption value="">{t('market.sortNewest')}</IonSelectOption>
            <IonSelectOption value="price_asc">{t('market.sortPriceLow')}</IonSelectOption>
            <IonSelectOption value="price_desc">{t('market.sortPriceHigh')}</IonSelectOption>
          </IonSelect>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '8px 12px 0' }}>
          <IonSelect
            label={t('market.filterCategory')} labelPlacement="stacked" interface="action-sheet"
            value={category} placeholder={t('common.all')} style={{ flex: 1 }}
            onIonChange={(e) => setCategory(e.detail.value)}>
            <IonSelectOption value="">{t('common.all')}</IonSelectOption>
            {categories.map((c) => <IonSelectOption key={c} value={c}>{t(`category.${c}`)}</IonSelectOption>)}
          </IonSelect>
          <IonSelect
            label={t('market.filterProvince')} labelPlacement="stacked" interface="action-sheet"
            value={province} placeholder={t('common.all')} style={{ flex: 1 }}
            onIonChange={(e) => setProvince(e.detail.value)}>
            <IonSelectOption value="">{t('common.all')}</IonSelectOption>
            {provinces.map((p) => <IonSelectOption key={p} value={p}>{p}</IonSelectOption>)}
          </IonSelect>
        </div>

        {loading ? (
          <div className="empty-state"><IonSpinner /></div>
        ) : crops.length === 0 ? (
          <div className="empty-state">{t('market.empty')}</div>
        ) : (
          crops.map((crop) => (
            <IonCard key={crop.id} button onClick={() => history.push(`/market/${crop.id}`)}>
              {crop.image_url
                ? <img className="crop-thumb" src={crop.image_url} alt={crop.crop_name} />
                : <div className="crop-thumb">{categoryEmoji[crop.category] ?? '🧺'}</div>}
              <IonCardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, fontWeight: 700 }}>{crop.crop_name}</h2>
                  <IonChip color="success">{t(`category.${crop.category}`)}</IonChip>
                </div>
                <div className="price-tag">{formatKHR(crop.price_per_kg_khr)}{t('common.perKg')}</div>
                <p style={{ margin: '6px 0', color: '#5a6b5a' }}>
                  {t('market.by')} <b>{crop.farmer_name}</b> · {crop.farmer_province}
                </p>
                <IonBadge color="medium">{crop.quantity_kg} {t('common.kg')} {t('market.available')}</IonBadge>
                <IonButton expand="block" style={{ marginTop: 10 }} onClick={(e) => { e.stopPropagation(); history.push(`/market/${crop.id}`); }}>
                  {t('market.buy')}
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

export default MarketPage;
