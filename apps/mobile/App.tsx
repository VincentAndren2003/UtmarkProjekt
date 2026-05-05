import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MapScreen } from './src/screens/MapScreen';
import { ProfileUpsertScreen } from './src/screens/ProfileUpsertScreen';
import { CreateRouteScreen } from './src/screens/CreateRouteScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  Map: undefined;
  ProfileUpsert: undefined;
  CreateRoute: { from?: 'Login' | 'CreateAccount' } | undefined;
  Favorites: { from?: 'Login' | 'CreateAccount' } | undefined;
  Profile: { from?: 'Login' | 'CreateAccount' } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type screen =
  | 'home'
  | 'welcome'
  | 'map'
  | 'login'
  | 'createAccount'
  | 'profileUpsert'
  | 'createRoute'
  | 'favorites'
  | 'profile';

export default function App() {
  // Stack.Navigator initialRoute means app start on home screen
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTransparent: true,
            headerShadowVisible: false,
            headerTintColor: '#fff',
            headerTitleStyle: { color: '#fff' },
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="ProfileUpsert" component={ProfileUpsertScreen} />
        <Stack.Screen
          name="CreateRoute"
          component={CreateRouteScreen}
          options={{ headerShown: false, animation: 'fade', animationDuration: 140 }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ headerShown: false, animation: 'fade', animationDuration: 140 }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false, animation: 'fade', animationDuration: 140 }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
  // NavigationContainer is the root component that wraps all the screens, so this is where we list all screens
}
