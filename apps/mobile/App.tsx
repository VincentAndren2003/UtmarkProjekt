import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BadgeCelebrationProvider } from './src/context/BadgeCelebrationContext';
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
import { RunDetailScreen } from './src/screens/RunDetailScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { FriendRequestsScreen } from './src/screens/FriendRequestsScreen';
import { RouteStartedScreen } from './src/screens/RouteStartedScreen';
import { CheckpointTakenScreen } from './src/screens/CheckpointTakenScreen';
import { RouteCompletedScreen } from './src/screens/RouteCompletedScreen';
import { CancelRouteScreen } from './src/screens/CancelRouteScreen';
import { RouteResponse } from './src/types/route';
import { RunRecord } from './src/lib/api';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  Map: undefined;
  ProfileUpsert: undefined;
  CreateRoute:
    | {
        from?: 'Login' | 'CreateAccount';
        activeRoute?: RouteResponse;
        runId?: string;
        savedRouteId?: string;
        /** Nollställ kartvy efter avslutad rutt. */
        runFinished?: boolean;
        /** Öppna befintlig rutt i generated-läge (t.ex. accepterad utmaning). */
        openAsGenerated?: boolean;
        /** Tid att slå från utmanarens avslutade körning (sekunder). */
        challengeTargetSeconds?: number;
        challengeFromName?: string;
      }
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
  RouteCompleted: {
    routeName: string;
    totalCheckpoints: number;
    checkpointsCompleted: number;
    elapsedMin: number;
    distanceKm: string;
    paceMinPerKm: string;
    plannedDistanceKm: number;
    runId?: string;
    savedRouteId?: string;
    routeSnapshot: RouteResponse;
    from?: 'Login' | 'CreateAccount';
    /** Badges to show unlock celebration for after completed run. */
    celebrationBadgeIds?: string[];
    challengeTargetSeconds?: number;
    challengeFromName?: string;
    elapsedSeconds?: number;
  };
  CancelRoute: {
    routeName: string;
    totalCheckpoints: number;
    checkpointsCompleted: number;
    elapsedMin: number;
    distanceKm: string;
    paceMinPerKm: string;
    plannedDistanceKm: number;
    from?: 'Login' | 'CreateAccount';
    runId?: string;
    elapsedSeconds?: number;
    distanceMeters?: number;
  };
  History: undefined;
  RunDetail: { run: RunRecord };
  Favorites: { from?: 'Login' | 'CreateAccount' } | undefined;
  Profile: { from?: 'Login' | 'CreateAccount' } | undefined;
  Challenges: undefined;
  Badges: undefined;
  Friends: undefined;
  FriendRequests: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  // Stack.Navigator initialRoute means app start on home screen
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <BadgeCelebrationProvider
          onViewAllBadges={() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('Badges');
            }
          }}
        >
          <NavigationContainer ref={navigationRef}>
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
                name="RouteCompleted"
                component={RouteCompletedScreen}
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 140,
                }}
              />
              <Stack.Screen
                name="CancelRoute"
                component={CancelRouteScreen}
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
                name="RunDetail"
                component={RunDetailScreen}
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
              <Stack.Screen
                name="Friends"
                component={FriendsScreen}
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 140,
                }}
              />
              <Stack.Screen
                name="FriendRequests"
                component={FriendRequestsScreen}
                options={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 140,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </BadgeCelebrationProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
  // NavigationContainer is the root component that wraps all the screens, so this is where we list all screens
}
