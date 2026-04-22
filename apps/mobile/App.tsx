import { HomeScreen } from './src/screens/HomeScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'welcome'>('home');

  return (
    <>
      {screen === 'home' ? (
        <HomeScreen onGoWelcome={() => setScreen('welcome')} />
      ) : (
        <MapScreen onBack={() => setScreen('home')}/>
      )}
      <StatusBar style="auto" />
    </>
  );
}
