import { HomeScreen } from './src/screens/HomeScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { OrienteeringMapScreen } from './src/screens/OrienteeringMapScreen';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TEST_COURSE } from './src/testCourse';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'welcome'>('home');

  const course = {}

  return (
    <>
      {screen === 'home' ? (
        <HomeScreen onGoWelcome={() => setScreen('welcome')} />
      ) : (
        <OrienteeringMapScreen onBack={() => setScreen('home') } courseGeoJSON={TEST_COURSE}/>
      )}
      <StatusBar style="auto" />
    </>
  );
}
