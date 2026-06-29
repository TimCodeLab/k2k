import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonChip, useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useMeta } from '../hooks/useMeta';
import type { CalendarPlan } from '../types';
import LanguageToggle from '../components/LanguageToggle';

const CalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const { provinces, categories } = useMeta();
  const [present] = useIonToast();

  const [province, setProvince] = useState(user?.province ?? 'Battambang');
  const [category, setCategory] = useState('Rice');
  const [hectares, setHectares] = useState<number>(1);
  const [plan, setPlan] = useState<CalendarPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const calc = async () => {
    setLoading(true);
    try {
      setPlan(await api.calendarPlan({ province, category, hectares }));
    } catch {
      present({ message: t('error.network'), duration: 2000, color: 'danger' });
    } finally { setLoading(false); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar">
          <IonTitle>📅 {t('calendar.title')}</IonTitle>
          <IonButtons slot="end"><LanguageToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <p className="section-sub">{t('calendar.subtitle')}</p>

        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">{t('calendar.province')}</IonLabel>
              <IonSelect value={province} interface="action-sheet" onIonChange={(e) => setProvince(e.detail.value)}>
                {provinces.map((p) => <IonSelectOption key={p} value={p}>{p}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('calendar.category')}</IonLabel>
              <IonSelect value={category} interface="action-sheet" onIonChange={(e) => setCategory(e.detail.value)}>
                {categories.map((c) => <IonSelectOption key={c} value={c}>{t(`category.${c}`)}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('calendar.hectares')}</IonLabel>
              <IonInput type="number" min="0.1" step="0.1" value={hectares}
                onIonInput={(e) => setHectares(Number(e.detail.value) || 0)} />
            </IonItem>
            <IonButton expand="block" style={{ marginTop: 14 }} onClick={calc} disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : t('calendar.calculate')}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {plan && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="num">{plan.seed_needed_kg}</div>
                <div className="lbl">{t('calendar.seedNeeded')} ({t('common.kg')})</div>
              </div>
              <div className="stat-card">
                <div className="num">{plan.compost_needed_kg}</div>
                <div className="lbl">{t('calendar.compostNeeded')} ({t('common.kg')})</div>
              </div>
              <div className="stat-card">
                <div className="num">{plan.cycle_days}</div>
                <div className="lbl">{t('calendar.cycle')} ({t('calendar.days')})</div>
              </div>
              <div className="stat-card">
                <div className="num">{plan.hectares}</div>
                <div className="lbl">{t('calendar.hectares')}</div>
              </div>
            </div>
            <IonCard>
              <IonCardContent>
                <b>{t('calendar.rotation')}</b>
                {plan.heavy_rice_zone && <IonChip color="success" style={{ marginLeft: 8 }}>{t('calendar.heavyZone')}</IonChip>}
                <p style={{ lineHeight: 1.7 }}>{i18n.language === 'km' ? plan.rotation.km : plan.rotation.en}</p>
              </IonCardContent>
            </IonCard>
          </>
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
