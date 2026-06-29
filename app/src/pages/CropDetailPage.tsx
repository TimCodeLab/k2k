import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner,
  IonChip, IonText, useIonToast,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { formatKHR, categoryEmoji, khqrImageUrl } from '../utils';
import type { Crop, Order } from '../types';

const CropDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [present] = useIonToast();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<number | undefined>();
  const [address, setAddress] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<{ khqr_string: string | null; amount_khr: number } | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.getCrop(id).then(({ crop }) => { setCrop(crop); setQty(crop.quantity_kg); })
      .catch(() => present({ message: t('error.network'), duration: 2000, color: 'danger' }))
      .finally(() => setLoading(false));
  }, [id]);

  const total = crop && qty ? qty * crop.price_per_kg_khr : 0;

  const placeOrder = async () => {
    if (!user) return present({ message: t('profile.notRegistered'), duration: 2500, color: 'warning' });
    if (!address.trim()) return present({ message: t('error.required'), duration: 2000, color: 'warning' });
    setPlacing(true);
    try {
      const res = await api.createOrder({ crop_id: crop!.id, delivery_address: address, quantity_kg: qty });
      setOrder(res.order);
      setPayment({ khqr_string: res.payment.khqr_string ?? crop?.farmer_khqr ?? null, amount_khr: res.payment.amount_khr });
      present({ message: t('detail.orderCreated'), duration: 2000, color: 'success' });
    } catch {
      present({ message: t('error.generic'), duration: 2000, color: 'danger' });
    } finally { setPlacing(false); }
  };

  const updateStatus = async (status: string) => {
    if (!order) return;
    try {
      const res = await api.setOrderStatus(order.id, status);
      setOrder({ ...order, order_status: (res.order_status as Order['order_status']) });
      present({ message: t(`status.${res.order_status}`), duration: 1800, color: 'success' });
    } catch { present({ message: t('error.generic'), duration: 2000, color: 'danger' }); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar">
          <IonButtons slot="start"><IonBackButton defaultHref="/market" /></IonButtons>
          <IonTitle>{t('detail.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading || !crop ? (
          <div className="empty-state"><IonSpinner /></div>
        ) : (
          <>
            <IonCard>
              {crop.image_url
                ? <img className="crop-thumb" src={crop.image_url} alt={crop.crop_name} />
                : <div className="crop-thumb" style={{ height: 180 }}>{categoryEmoji[crop.category] ?? '🧺'}</div>}
              <IonCardContent>
                <h1 style={{ marginTop: 0 }}>{crop.crop_name}</h1>
                <IonChip color="success">{t(`category.${crop.category}`)}</IonChip>
                <div className="price-tag" style={{ fontSize: 22, margin: '8px 0' }}>
                  {formatKHR(crop.price_per_kg_khr)}{t('common.perKg')}
                </div>
                <p><b>{t('detail.farmer')}:</b> {crop.farmer_name}</p>
                <p><b>{t('detail.province')}:</b> {crop.farmer_province} · {crop.farmer_district}</p>
                <p><b>{t('detail.quantity')}:</b> {crop.quantity_kg} {t('common.kg')}</p>
                {crop.harvest_date && <p><b>{t('detail.harvest')}:</b> {crop.harvest_date}</p>}
              </IonCardContent>
            </IonCard>

            {!order ? (
              <IonCard>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">{t('detail.orderQty')}</IonLabel>
                    <IonInput type="number" value={qty} max={crop.quantity_kg} min={1}
                      onIonInput={(e) => setQty(Number(e.detail.value))} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">{t('detail.deliveryAddress')}</IonLabel>
                    <IonInput value={address} placeholder={t('detail.deliveryPlaceholder')}
                      onIonInput={(e) => setAddress(e.detail.value ?? '')} />
                  </IonItem>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 4px' }}>
                    <span><b>{t('detail.total')}</b></span>
                    <span className="price-tag">{formatKHR(total)}</span>
                  </div>
                  <IonButton expand="block" onClick={placeOrder} disabled={placing}>
                    {placing ? <IonSpinner name="dots" /> : t('detail.placeOrder')}
                  </IonButton>
                  <IonText color="medium"><p style={{ fontSize: 12 }}>{t('detail.escrowNote')}</p></IonText>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonCard className="qr-card">
                <IonCardContent>
                  <h2>{t('detail.orderCreated')}</h2>
                  <p style={{ color: '#5a6b5a' }}>#{order.id}</p>
                  <div className="price-tag" style={{ fontSize: 24 }}>{formatKHR(order.total_price_khr)}</div>
                  <p style={{ marginTop: 12 }}><b>{t('detail.scanToPay')}</b></p>
                  <img src={khqrImageUrl(payment?.khqr_string || `BAKONG-ESCROW-${order.id}-${order.total_price_khr}`)}
                       alt="KHQR" width={220} height={220} />
                  <IonChip color="warning">{t('detail.orderStatus')}: {t(`status.${order.order_status}`)}</IonChip>

                  <div style={{ marginTop: 12 }}>
                    {order.order_status === 'created' && (
                      <IonButton expand="block" color="secondary" onClick={() => updateStatus('paid_escrow')}>
                        {t('detail.markPaid')}
                      </IonButton>
                    )}
                    {(order.order_status === 'paid_escrow' || order.order_status === 'in_transit') && (
                      <IonButton expand="block" color="success" onClick={() => updateStatus('delivered')}>
                        {t('detail.markDelivered')}
                      </IonButton>
                    )}
                  </div>
                  <IonText color="medium"><p style={{ fontSize: 12 }}>{t('detail.escrowNote')}</p></IonText>
                </IonCardContent>
              </IonCard>
            )}
            <div style={{ height: 24 }} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CropDetailPage;
