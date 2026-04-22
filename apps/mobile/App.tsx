import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
<<<<<<< HEAD
import { MapScreen } from './src/screens/MapScreen';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
=======
import { LoginScreen } from './src/screens/LoginScreen';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
>>>>>>> f69ad4d (feat/add-login-screen)

type screen = 'home' | 'welcome' | 'map';

export default function App() {
<<<<<<< HEAD
  const [screen, setScreen] = useState<'home' | 'welcome' | 'map'>('home');

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onGoWelcome={() => setScreen('welcome')}
          onGoMap={() => setScreen('map')}
        />
      )}
      {screen === 'welcome' && (
        <WelcomeScreen onBack={() => setScreen('home')} />
      )}
      {screen === 'map' && <MapScreen onBack={() => setScreen('home')} />}
      <StatusBar style="auto" />
    </>
=======
  // Stack.Navigator initialRoute means app start on home screen
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
>>>>>>> f69ad4d (feat/add-login-screen)
  );
  // NavigationContainer is the root component that wraps all the screens, so this is where we list all screens
}
