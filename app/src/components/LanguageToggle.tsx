import React from 'react';
import { IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { LANG_STORAGE_KEY } from '../i18n';

// Flag + code shown for each language. Uses flagcdn SVGs (emoji flags don't
// render on Windows). The pill shows the CURRENT language; tapping switches.
const LANGS: Record<'km' | 'en', { code: string; flag: string; label: string }> = {
  km: { code: 'KM', flag: 'https://flagcdn.com/kh.svg', label: 'ខ្មែរ' },
  en: { code: 'EN', flag: 'https://flagcdn.com/gb.svg', label: 'English' },
};

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const current: 'km' | 'en' = i18n.language === 'en' ? 'en' : 'km';
  const meta = LANGS[current];

  const toggle = () => {
    const next = current === 'km' ? 'en' : 'km';
    i18n.changeLanguage(next);
    localStorage.setItem(LANG_STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  return (
    <IonButton
      fill="clear" color="light" className="lang-pill"
      onClick={toggle} aria-label={`Language: ${meta.label}`}>
      <span className="lang-toggle">
        <img className="lang-flag" src={meta.flag} alt={`${meta.code} flag`} />
        <span className="lang-code">{meta.code}</span>
      </span>
    </IonButton>
  );
};

export default LanguageToggle;
