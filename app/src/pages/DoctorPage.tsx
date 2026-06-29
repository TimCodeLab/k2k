import React, { useRef, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea,
  IonButton, IonSpinner, IonIcon, IonText, useIonToast,
} from '@ionic/react';
import { mic, volumeHigh, stopCircle, send, camera, close } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useSession } from '../context/SessionContext';
import { compressImage } from '../utils';

// Browser Speech Recognition (Khmer) — graceful when unsupported.
const SpeechRec: any =
  (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

const DoctorPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const [present] = useIonToast();
  const recRef = useRef<any>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [transcript, setTranscript] = useState('');
  const [cropContext, setCropContext] = useState('');
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [photo, setPhoto] = useState<{ blob: Blob; preview: string } | null>(null);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await compressImage(file);
      setPhoto({ blob, preview: URL.createObjectURL(blob) });
    } catch { present({ message: t('error.generic'), duration: 2000, color: 'danger' }); }
  };

  const startRec = () => {
    if (!SpeechRec) return present({ message: t('doctor.micDenied'), duration: 2500, color: 'warning' });
    const rec = new SpeechRec();
    rec.lang = i18n.language === 'km' ? 'km-KH' : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      setTranscript(text);
    };
    rec.onerror = () => { setRecording(false); present({ message: t('doctor.micDenied'), duration: 2000, color: 'warning' }); };
    rec.onend = () => setRecording(false);
    recRef.current = rec;
    setRecording(true);
    rec.start();
  };

  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  const ask = async () => {
    if (!transcript.trim() && !photo) return;
    setThinking(true);
    setAnswer('');
    try {
      let res;
      if (photo) {
        // Vision diagnosis from the plant photo (+ optional text).
        const fd = new FormData();
        fd.append('image', photo.blob, 'plant.jpg');
        if (transcript.trim()) fd.append('transcript_khmer', transcript);
        if (cropContext) fd.append('crop_context', cropContext);
        if (user?.id) fd.append('user_id', user.id);
        res = await api.diagnose(fd);
      } else {
        res = await api.ask({ user_id: user?.id, transcript_khmer: transcript, crop_context: cropContext || undefined });
      }
      setAnswer(res.answer);
    } catch {
      present({ message: t('error.network'), duration: 2000, color: 'danger' });
    } finally { setThinking(false); }
  };

  const speak = () => {
    if (!answer || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(answer);
    u.lang = i18n.language === 'km' ? 'km-KH' : 'en-US';
    window.speechSynthesis.speak(u);
  };
  const stopSpeak = () => window.speechSynthesis?.cancel();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="brand-toolbar"><IonTitle>🩺 {t('doctor.title')}</IonTitle></IonToolbar>
      </IonHeader>

      <IonContent>
        <p className="section-sub">{t('doctor.subtitle')}</p>

        <div className="mic-wrap">
          <button
            className={`mic-btn ${recording ? 'rec' : ''}`}
            onMouseDown={startRec} onMouseUp={stopRec}
            onTouchStart={(e) => { e.preventDefault(); startRec(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRec(); }}>
            <IonIcon icon={mic} />
          </button>
          <IonText color="medium"><p>{recording ? t('doctor.recording') : t('doctor.hold')}</p></IonText>
        </div>

        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">{t('doctor.cropContext')}</IonLabel>
              <IonInput value={cropContext} onIonInput={(e) => setCropContext(e.detail.value ?? '')}
                placeholder="🌽 / 🌾 / 🥬" />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('doctor.title')}</IonLabel>
              <IonTextarea autoGrow rows={3} value={transcript}
                placeholder={t('doctor.typePlaceholder')}
                onIonInput={(e) => setTranscript(e.detail.value ?? '')} />
            </IonItem>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
            {photo ? (
              <div style={{ position: 'relative', marginTop: 12 }}>
                <img src={photo.preview} alt="plant" className="crop-thumb" style={{ borderRadius: 12, height: 160 }} />
                <IonButton size="small" color="light" style={{ position: 'absolute', top: 6, right: 6 }}
                  onClick={() => setPhoto(null)}>
                  <IonIcon icon={close} slot="icon-only" /> {t('doctor.removePhoto')}
                </IonButton>
              </div>
            ) : (
              <IonButton expand="block" fill="outline" style={{ marginTop: 12 }} onClick={() => fileRef.current?.click()}>
                <IonIcon icon={camera} slot="start" />{t('doctor.addPhoto')}
              </IonButton>
            )}
            <IonText color="medium"><p style={{ fontSize: 12, margin: '6px 2px 0' }}>{t('doctor.photoHint')}</p></IonText>

            <IonButton expand="block" style={{ marginTop: 12 }} onClick={ask} disabled={thinking || (!transcript.trim() && !photo)}>
              {thinking ? <><IonSpinner name="dots" />&nbsp;{t('doctor.thinking')}</>
                : <><IonIcon icon={photo ? camera : send} slot="start" />{photo ? t('doctor.diagnosePhoto') : t('doctor.ask')}</>}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {answer && (
          <IonCard className="advice-box">
            <IonCardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b>🌱 {t('doctor.answer')}</b>
                <IonButtons>
                  <IonButton onClick={speak}><IonIcon icon={volumeHigh} slot="icon-only" /></IonButton>
                  <IonButton onClick={stopSpeak}><IonIcon icon={stopCircle} slot="icon-only" /></IonButton>
                </IonButtons>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{answer}</p>
            </IonCardContent>
          </IonCard>
        )}
        <div style={{ height: 24 }} />
      </IonContent>
    </IonPage>
  );
};

export default DoctorPage;
