import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { storefront, addCircle, leaf, calendar, person } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import MarketPage from './pages/MarketPage';
import CropDetailPage from './pages/CropDetailPage';
import SellPage from './pages/SellPage';
import DoctorPage from './pages/DoctorPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/market" component={MarketPage} />
            <Route exact path="/market/:id" component={CropDetailPage} />
            <Route exact path="/sell" component={SellPage} />
            <Route exact path="/doctor" component={DoctorPage} />
            <Route exact path="/calendar" component={CalendarPage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route exact path="/"><Redirect to="/market" /></Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="market" href="/market">
              <IonIcon icon={storefront} />
              <IonLabel>{t('tab.market')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="sell" href="/sell">
              <IonIcon icon={addCircle} />
              <IonLabel>{t('tab.sell')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="doctor" href="/doctor">
              <IonIcon icon={leaf} />
              <IonLabel>{t('tab.doctor')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="calendar" href="/calendar">
              <IonIcon icon={calendar} />
              <IonLabel>{t('tab.calendar')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={person} />
              <IonLabel>{t('tab.profile')}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
