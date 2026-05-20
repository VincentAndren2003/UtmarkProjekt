import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { savePersistedRoute } from '../lib/api';
import { addFavoriteRoute } from '../services/favoritesStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'RouteCompleted'>;

export function RouteCompletedScreen({ navigation, route }: Props) {
  const {
    routeName,
    totalCheckpoints,
    checkpointsCompleted,
    elapsedMin,
    distanceKm,
    paceMinPerKm,
    plannedDistanceKm,
    savedRouteId: initialSavedRouteId,
    routeSnapshot,
    from,
  } = route.params;

  const [savedRouteId, setSavedRouteId] = useState(initialSavedRouteId ?? null);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const handleSaveFavorite = async () => {
    if (savedRouteId || !routeSnapshot) return;
    setSavingFavorite(true);
    try {
      const saved = await savePersistedRoute(routeSnapshot);
      await addFavoriteRoute(saved, routeName.trim() || 'Min rutt');
      setSavedRouteId(saved._id);
      Alert.alert(
        'Sparad',
        'Rutten finns nu under Favoriter. Du kan döpa om den där.'
      );
    } catch (err) {
      Alert.alert(
        'Kunde inte spara',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setSavingFavorite(false);
    }
  };

  const finishAndGoHome = () => {
    navigation.navigate('CreateRoute', { from, runFinished: true });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rutt avslutad!</Text>
        <Text style={styles.subtitle}>Snyggt jobbat!</Text>

        <Text style={styles.progressLabel}>
          {checkpointsCompleted} / {totalCheckpoints} checkpoints tagna
        </Text>

        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            {Array.from({ length: totalCheckpoints }, (_, index) => {
              const number = index + 1;
              const isLast = index === totalCheckpoints - 1;
              return (
                <View key={`cp-${number}`} style={styles.progressSegment}>
                  <View style={styles.progressCell}>
                    <View style={styles.progressDotDone}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                    <Text style={styles.progressNumber}>{number}</Text>
                  </View>
                  {!isLast && <View style={styles.progressConnector} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statLabelSlot}>
                <Text
                  style={styles.statLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Tid
                </Text>
              </View>
              <View style={styles.statValueSlot}>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {elapsedMin} min
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statLabelSlot}>
                <Text
                  style={styles.statLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Checkpoint
                </Text>
              </View>
              <View style={styles.statValueSlot}>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {checkpointsCompleted}/{totalCheckpoints}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statLabelSlot}>
                <Text
                  style={styles.statLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Distans
                </Text>
              </View>
              <View style={styles.statValueSlot}>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {distanceKm} km
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statLabelSlot}>
                <Text
                  style={styles.statLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Snitt
                </Text>
              </View>
              <View style={styles.statValueSlot}>
                <Text
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {paceMinPerKm}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeThumb}>
            <Ionicons name="trail-sign-outline" size={28} color="#6b8f74" />
          </View>
          <View style={styles.routeCardText}>
            <Text style={styles.routeCardName} numberOfLines={1}>
              {routeName}
            </Text>
            <Text style={styles.routeCardMeta}>
              {plannedDistanceKm} km, {totalCheckpoints} checkpoints
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            // TODO: Utmana vän när utmaningsflödet finns.
            Alert.alert(
              'Kommer snart',
              'Här ska du kunna utmana en vän på samma rutt.'
            );
          }}
        >
          <Text style={styles.primaryButtonText}>Utmana en vän!</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            savedRouteId && styles.secondaryButtonSaved,
          ]}
          onPress={handleSaveFavorite}
          disabled={savingFavorite || Boolean(savedRouteId) || !routeSnapshot}
        >
          {savingFavorite ? (
            <ActivityIndicator color="#2f7a3f" />
          ) : (
            <>
              <Ionicons
                name={savedRouteId ? 'heart' : 'heart-outline'}
                size={22}
                color="#2f7a3f"
              />
              <Text style={styles.secondaryButtonText}>
                {savedRouteId ? 'Sparad som favorit' : 'Spara som favorit'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <BottomNav
        navigation={navigation}
        activeTab="CreateRoute"
        fromOrigin={from}
        onHomePress={finishAndGoHome}
      />
    </View>
  );
}

const PROGRESS_DOT_SIZE = 22;
const PROGRESS_CONNECTOR_WIDTH = 48;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2f7a3f',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 22,
  },
  progressLabel: {
    fontSize: 14,
    color: '#8a949c',
    textAlign: 'center',
    marginBottom: 14,
  },
  progressBlock: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSegment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressCell: {
    alignItems: 'center',
    width: PROGRESS_DOT_SIZE,
  },
  progressDotDone: {
    width: PROGRESS_DOT_SIZE,
    height: PROGRESS_DOT_SIZE,
    borderRadius: PROGRESS_DOT_SIZE / 2,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressConnector: {
    width: PROGRESS_CONNECTOR_WIDTH,
    height: 2,
    backgroundColor: '#6ea97b',
    marginTop: PROGRESS_DOT_SIZE / 2 - 1,
  },
  progressNumber: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#2f7a3f',
    textAlign: 'center',
  },
  statsSection: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e8e2',
    paddingVertical: 16,
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'center',
    height: 40,
    backgroundColor: '#e0e8e2',
    marginHorizontal: 6,
  },
  statLabelSlot: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  statValueSlot: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#5f7a66',
    fontWeight: '400',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#eef4f7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 22,
    gap: 12,
  },
  routeThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#dce8e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCardText: {
    flex: 1,
    minWidth: 0,
  },
  routeCardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  routeCardMeta: {
    fontSize: 14,
    color: '#5f6b72',
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f3ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonSaved: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: '#2f7a3f',
    fontSize: 17,
    fontWeight: '600',
  },
});
