import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonChip, IonText, IonAvatar, useIonToast, IonList, IonNote,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { useMeta } from '../hooks/useMeta';
import { formatKHR } from '../utils';
import type { Order, Role } from '../types';
import LanguageToggle from '../components/LanguageToggle';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, setSession, clear } = useSession();
  const { provinces } = useMeta();
  const [present] = useIonToast();

  // Auth flow state
  const [phase, setPhase] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  // Profile fields (only used when registering a brand-new phone)
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [province, setProvince] = useState('Battambang');
  const [district, setDistrict] = useState('');
  const [khqr, setKhqr] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) api.getOrders(user.id).then((r) => setOrders(r.orders)).catch(() => {});
  }, [user]);

  const sendCode = async () => {
    if (!/^\d{6,15}$/.test(phone)) return present({ message: t('error.required'), duration: 2000, color: 'warning' });
    setBusy(true);
    try {
      const r = await api.requestOtp(phone);
      setIsRegistered(r.is_registered);
      setDevCode(r.dev_code ?? null);
      setPhase('code');
    } catch { present({ message: t('error.network'), duration: 2000, color: 'danger' }); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return present({ message: t('auth.enterCode'), duration: 2000, color: 'warning' });
    if (!isRegistered && (!name || !district)) return present({ message: t('error.required'), duration: 2000, color: 'warning' });
    setBusy(true);
    try {
      const r = await api.verifyOtp({
        phone, code,
        ...(isRegistered ? {} : { name, role, province, district, khqr_string: role === 'farmer' ? khqr : undefined }),
      });
      setSession(r.user, r.token);
      present({ message: t('common.success'), duration: 1600, color: 'success' });
    } catch (e: any) {
      present({ message: e?.message === 'otp_mismatch' ? t('auth.enterCode') : t('error.generic'), duration: 2200, color: 'danger' });
    } finally { setBusy(false); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar">
          <IonTitle>{t('profile.title')}</IonTitle>
          <IonButtons slot="end"><LanguageToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {user ? (
          <>
            <IonCard>
              <IonCardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <IonAvatar style={{ background: '#c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {user.role === 'farmer' ? '🧑‍🌾' : user.role === 'buyer' ? '🛒' : '🚚'}
                  </IonAvatar>
                  <div>
                    <h2 style={{ margin: 0 }}>{user.name}</h2>
                    <IonText color="medium">{t(`role.${user.role}`)} · {user.province}</IonText>
                  </div>
                </div>
                <p style={{ marginTop: 10 }}>{t('profile.phone')}: {user.phone}</p>
                <IonButton expand="block" fill="outline" color="medium" onClick={clear}>
                  {t('profile.logout')}
                </IonButton>
              </IonCardContent>
            </IonCard>

            <h3 style={{ margin: '16px' }}>{t('profile.myOrders')}</h3>
            {orders.length === 0 ? (
              <div className="empty-state">—</div>
            ) : (
              <IonList>
                {orders.map((o) => (
                  <IonItem key={o.id}>
                    <IonLabel>
                      <h3>{o.crop_name}</h3>
                      <p>#{o.id} · {formatKHR(o.total_price_khr)}</p>
                    </IonLabel>
                    <IonChip slot="end" color="success">{t(`status.${o.order_status}`)}</IonChip>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        ) : (
          <IonCard>
            <IonCardContent>
              <h2 style={{ marginTop: 0 }}>{t('auth.signIn')}</h2>

              {phase === 'phone' ? (
                <>
                  <IonText color="medium"><p>{t('auth.phonePrompt')}</p></IonText>
                  <IonItem>
                    <IonLabel position="stacked">{t('profile.phone')}</IonLabel>
                    <IonInput type="tel" inputmode="tel" value={phone} placeholder="0XXXXXXXX"
                      onIonInput={(e) => setPhone((e.detail.value ?? '').replace(/\D/g, ''))} />
                  </IonItem>
                  <IonButton expand="block" style={{ marginTop: 14 }} onClick={sendCode} disabled={busy}>
                    {busy ? <IonSpinner name="dots" /> : t('auth.sendCode')}
                  </IonButton>
                </>
              ) : (
                <>
                  <IonText color="medium"><p>{t('auth.codeSent')} <b>{phone}</b></p></IonText>
                  {devCode && (
                    <IonNote color="warning" style={{ display: 'block', margin: '0 0 8px' }}>
                      🔑 {t('auth.devCode')}: <b>{devCode}</b>
                    </IonNote>
                  )}
                  <IonItem>
                    <IonLabel position="stacked">{t('auth.enterCode')}</IonLabel>
                    <IonInput type="number" inputmode="numeric" value={code} maxlength={6}
                      onIonInput={(e) => setCode((e.detail.value ?? '').replace(/\D/g, '').slice(0, 6))} />
                  </IonItem>

                  {!isRegistered && (
                    <>
                      <div style={{ margin: '14px 0 4px', fontWeight: 600 }}>{t('auth.completeProfile')}</div>
                      <IonItem>
                        <IonLabel position="stacked">{t('profile.name')}</IonLabel>
                        <IonInput value={name} onIonInput={(e) => setName(e.detail.value ?? '')} />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">{t('profile.role')}</IonLabel>
                        <IonSelect value={role} interface="action-sheet" onIonChange={(e) => setRole(e.detail.value)}>
                          <IonSelectOption value="farmer">{t('role.farmer')}</IonSelectOption>
                          <IonSelectOption value="buyer">{t('role.buyer')}</IonSelectOption>
                          <IonSelectOption value="logistics">{t('role.logistics')}</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">{t('profile.province')}</IonLabel>
                        <IonSelect value={province} interface="action-sheet" onIonChange={(e) => setProvince(e.detail.value)}>
                          {provinces.map((p) => <IonSelectOption key={p} value={p}>{p}</IonSelectOption>)}
                        </IonSelect>
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">{t('profile.district')}</IonLabel>
                        <IonInput value={district} onIonInput={(e) => setDistrict(e.detail.value ?? '')} />
                      </IonItem>
                      {role === 'farmer' && (
                        <IonItem>
                          <IonLabel position="stacked">{t('profile.khqr')}</IonLabel>
                          <IonInput value={khqr} placeholder="00020101..." onIonInput={(e) => setKhqr(e.detail.value ?? '')} />
                        </IonItem>
                      )}
                    </>
                  )}

                  <IonButton expand="block" style={{ marginTop: 14 }} onClick={verify} disabled={busy}>
                    {busy ? <IonSpinner name="dots" /> : t('auth.verify')}
                  </IonButton>
                  <IonButton expand="block" fill="clear" color="medium" onClick={() => { setPhase('phone'); setCode(''); }}>
                    {t('auth.changePhone')}
                  </IonButton>
                </>
              )}
            </IonCardContent>
          </IonCard>
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
