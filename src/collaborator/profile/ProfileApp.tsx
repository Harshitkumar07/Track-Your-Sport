/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Profile from './components/Profile';
import OnboardingForm from './components/OnboardingForm';
import { UserData } from './types';

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('sports_app_user_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('sports_app_user_data', JSON.stringify(data));
  };

  if (!userData) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div>
      <Profile initialUser={userData} />
    </div>
  );
}


