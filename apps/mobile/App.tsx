import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateAccountScreen } from './src/screens/CreateAccountScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileUpsertScreen } from './src/screens/ProfileUpsertScreen';
import { CreateRouteScreen } from './src/screens/CreateRouteScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';
import { RouteStartedScreen } from './src/screens/RouteStartedScreen';
import { CheckpointTakenScreen } from './src/screens/CheckpointTakenScreen';
import { RouteResponse } from './src/types/route';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  Map: undefined;
  ProfileUpsert: undefined;
  CreateRoute:
    | { from?: 'Login' | 'CreateAccount'; activeRoute?: RouteResponse }
    | undefined;
  RouteStarted: { route: RouteResponse };
  CheckpointTaken: {
    routeName: string;
    currentCheckpoint: number;
    totalCheckpoints: number;
    elapsedMin: number;
    distanceKm: string;
    paceMinPerKm: string;
  };
  Favorites: { from?: 'Login' | 'CreateAccount' } | undefined;
  Profile: { from?: 'Login' | 'CreateAccount' } | undefined;
  History: undefined;
  Challenges: undefined;
  Badges: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        <Stack.Screen
          name="ProfileUpsert"
          component={ProfileUpsertScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateRoute"
          component={CreateRouteScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="RouteStarted"
          component={RouteStartedScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="CheckpointTaken"
          component={CheckpointTakenScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
        <Stack.Screen
          name="Badges"
          component={BadgesScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 140,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
  // NavigationContainer is the root component that wraps all the screens, so this is where we list all screens
}
