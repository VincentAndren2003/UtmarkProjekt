import { HomeScreen } from './src/screens/HomeScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

type screen = 'home' | 'welcome' | 'map';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'welcome' | 'map'>('home');

  return (
    <>
      {screen === 'home' && (
        <HomeScreen onGoWelcome={() => setScreen('welcome')} 
        onGoMap={() => setScreen('map')} 
        />
      )} 
      {screen === 'welcome' && (
        <WelcomeScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'map' && (
        <MapScreen onBack={() => setScreen('home')} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
