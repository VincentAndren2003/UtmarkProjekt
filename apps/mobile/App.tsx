import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MapScreen } from './src/screens/MapScreen';
import { ProfileUpsertScreen } from './src/screens/ProfileUpsertScreen';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  Map: undefined;
  ProfileUpsert: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type screen =
  | 'home'
  | 'welcome'
  | 'map'
  | 'login'
  | 'createAccount'
  | 'profileUpsert';

export default function App() {
  // Stack.Navigator initialRoute means app start on home screen
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="ProfileUpsert" component={ProfileUpsertScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  // NavigationContainer is the root component that wraps all the screens, so this is where we list all screens
}
