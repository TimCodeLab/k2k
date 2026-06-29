import React, { useRef, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonText, useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useMeta } from '../hooks/useMeta';
import { compressImage } from '../utils';
import LanguageToggle from '../components/LanguageToggle';

const SellPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const { categories } = useMeta();
  const [present] = useIonToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<string>('Rice');
  const [quantity, setQuantity] = useState<number | undefined>();
  const [price, setPrice] = useState<number | undefined>();
  const [harvest, setHarvest] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isFarmer = user?.role === 'farmer';

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const blob = await compressImage(file);           // Feature 4: compress on-device
      setPreview(URL.createObjectURL(blob));
      const res = await api.upload(blob, file.name);     // Worker writes to R2
      setImageUrl(res.url);
    } catch {
      present({ message: t('error.generic'), duration: 2000, color: 'danger' });
    } finally { setCompressing(false); }
  };

  const publish = async () => {
    if (!isFarmer || !user) return present({ message: t('sell.needFarmer'), duration: 2500, color: 'warning' });
    if (!cropName || !quantity || !price) return present({ message: t('error.required'), duration: 2000, color: 'warning' });
    setSaving(true);
    try {
      await api.newCrop({
        crop_name: cropName, category,
        quantity_kg: quantity, price_per_kg_khr: price,
        image_url: imageUrl, harvest_date: harvest || null,
      });
      present({ message: t('sell.published'), duration: 2000, color: 'success' });
      setCropName(''); setQuantity(undefined); setPrice(undefined); setHarvest('');
      setPreview(null); setImageUrl(null);
    } catch {
      present({ message: t('error.generic'), duration: 2000, color: 'danger' });
    } finally { setSaving(false); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar">
          <IonTitle>{t('sell.title')}</IonTitle>
          <IonButtons slot="end"><LanguageToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <p className="section-sub">{t('sell.subtitle')}</p>

        {!isFarmer && (
          <IonCard color="warning"><IonCardContent>{t('sell.needFarmer')}</IonCardContent></IonCard>
        )}

        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">{t('sell.cropName')}</IonLabel>
              <IonInput value={cropName} placeholder={t('sell.cropNamePlaceholder')}
                onIonInput={(e) => setCropName(e.detail.value ?? '')} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('sell.category')}</IonLabel>
              <IonSelect value={category} interface="action-sheet" onIonChange={(e) => setCategory(e.detail.value)}>
                {categories.map((c) => <IonSelectOption key={c} value={c}>{t(`category.${c}`)}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('sell.quantity')}</IonLabel>
              <IonInput type="number" value={quantity} onIonInput={(e) => setQuantity(Number(e.detail.value))} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('sell.price')}</IonLabel>
              <IonInput type="number" value={price} onIonInput={(e) => setPrice(Number(e.detail.value))} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('sell.harvest')} <IonText color="medium">({t('common.optional')})</IonText></IonLabel>
              <IonInput type="date" value={harvest} onIonInput={(e) => setHarvest(e.detail.value ?? '')} />
            </IonItem>

            <div style={{ marginTop: 14 }}>
              <IonLabel>{t('sell.photo')} <IonText color="medium">({t('common.optional')})</IonText></IonLabel>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
              <IonButton expand="block" fill="outline" style={{ marginTop: 8 }}
                onClick={() => fileRef.current?.click()} disabled={compressing}>
                {compressing ? <><IonSpinner name="dots" />&nbsp;{t('sell.compressing')}</> : `📷 ${t('sell.addPhoto')}`}
              </IonButton>
              {preview && <img src={preview} alt="preview" className="crop-thumb" style={{ marginTop: 10, borderRadius: 12 }} />}
            </div>

            <IonButton expand="block" style={{ marginTop: 18 }} onClick={publish} disabled={saving || !isFarmer}>
              {saving ? <IonSpinner name="dots" /> : t('sell.publish')}
            </IonButton>
          </IonCardContent>
        </IonCard>
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

export default SellPage;
