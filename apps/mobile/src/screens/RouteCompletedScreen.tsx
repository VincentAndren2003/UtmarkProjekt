import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';
import { useBadgeCelebration } from '../context/BadgeCelebrationContext';
import { BottomNav } from '../components/BottomNav';
import {
  getRouteRecord,
  savePersistedRoute,
  type SavedRouteRecord,
} from '../lib/api';
import { ChallengeFriendModal } from '../components/ChallengeFriendModal';
import { formatDurationClock } from '../utils/routeUtils';
import type { RouteResponse } from '../types/route';
import {
  addFavoriteRoute,
  defaultFavoriteDisplayName,
  isRouteFavorited,
  type FavoriteRunSummary,
} from '../services/favoritesStorage';

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
    runId,
    routeSnapshot,
    from,
    celebrationBadgeIds = [],
    challengeTargetSeconds,
    challengeFromName,
    elapsedSeconds,
  } = route.params;

  const beatChallenge =
    challengeTargetSeconds != null &&
    elapsedSeconds != null &&
    elapsedSeconds < challengeTargetSeconds;

  const [savedRouteId, setSavedRouteId] = useState(initialSavedRouteId ?? null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [favoriteNameDraft, setFavoriteNameDraft] = useState('');
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [preparingChallenge, setPreparingChallenge] = useState(false);
  const { showBadgeCelebration } = useBadgeCelebration();

  const openChallengeModal = async () => {
    if (!routeSnapshot) {
      Alert.alert('Kan inte utmana', 'Ruttdata saknas.');
      return;
    }
    if (savedRouteId) {
      setChallengeModalVisible(true);
      return;
    }
    setPreparingChallenge(true);
    try {
      const saved = await savePersistedRoute(routeSnapshot);
      setSavedRouteId(saved._id);
      setChallengeModalVisible(true);
    } catch (err) {
      Alert.alert(
        'Kunde inte spara rutt',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setPreparingChallenge(false);
    }
  };

  useEffect(() => {
    if (celebrationBadgeIds.length === 0) return;
    const timer = setTimeout(
      () => showBadgeCelebration(celebrationBadgeIds),
      400
    );
    return () => clearTimeout(timer);
  }, [celebrationBadgeIds, showBadgeCelebration]);

  useEffect(() => {
    if (!initialSavedRouteId) return;
    let cancelled = false;
    void isRouteFavorited(initialSavedRouteId).then((favorited) => {
      if (!cancelled && favorited) setIsFavorite(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initialSavedRouteId]);

  const openFavoriteNameModal = () => {
    if (isFavorite || !routeSnapshot) return;
    setFavoriteNameDraft(defaultFavoriteDisplayName());
    setNameModalVisible(true);
  };

  const confirmSaveFavorite = async () => {
    if (isFavorite || !routeSnapshot) return;
    const displayName =
      favoriteNameDraft.trim() || defaultFavoriteDisplayName();
    setNameModalVisible(false);
    setSavingFavorite(true);
    try {
      const saved = await resolveSavedRouteRecord(
        routeSnapshot,
        savedRouteId,
        setSavedRouteId
      );
      const runSummary: FavoriteRunSummary = {
        distanceKm,
        elapsedMin,
        checkpointsCompleted,
        checkpointTotal: totalCheckpoints,
      };
      await addFavoriteRoute(saved, displayName, runSummary);
      setIsFavorite(true);
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

        {challengeTargetSeconds != null && elapsedSeconds != null ? (
          <View
            style={[
              styles.challengeResult,
              beatChallenge
                ? styles.challengeResultWin
                : styles.challengeResultLose,
            ]}
          >
            <Text style={styles.challengeResultTitle}>
              {beatChallenge ? 'Du vann utmaningen!' : 'Utmaningen vanns inte'}
            </Text>
            <Text style={styles.challengeResultBody}>
              Din tid {formatDurationClock(elapsedSeconds)}
              {challengeFromName ? ` · mål från ${challengeFromName}` : ''}
              {' · '}måltid {formatDurationClock(challengeTargetSeconds)}
            </Text>
          </View>
        ) : null}

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
          onPress={openChallengeModal}
          disabled={preparingChallenge || !routeSnapshot}
        >
          {preparingChallenge ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Utmana en vän!</Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            isFavorite && styles.secondaryButtonSaved,
          ]}
          onPress={openFavoriteNameModal}
          disabled={savingFavorite || isFavorite || !routeSnapshot}
        >
          {savingFavorite ? (
            <ActivityIndicator color="#2f7a3f" />
          ) : (
            <>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#e53935' : '#2f7a3f'}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  isFavorite && styles.secondaryButtonTextSaved,
                ]}
              >
                {isFavorite ? 'Sparad som favorit' : 'Spara som favorit'}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {savedRouteId ? (
        <ChallengeFriendModal
          visible={challengeModalVisible}
          onClose={() => setChallengeModalVisible(false)}
          routeId={savedRouteId}
          sourceRunId={runId}
          targetSeconds={elapsedSeconds}
        />
      ) : null}

      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <Pressable
          style={styles.nameModalBackdrop}
          onPress={() => setNameModalVisible(false)}
        >
          <Pressable style={styles.nameModalCard} onPress={() => {}}>
            <Text style={styles.nameModalTitle}>Namnge favoritrutt</Text>
            <Text style={styles.nameModalHint}>
              {distanceKm} km · {elapsedMin} min · {checkpointsCompleted}/
              {totalCheckpoints} checkpoints
            </Text>
            <TextInput
              style={styles.nameModalInput}
              value={favoriteNameDraft}
              onChangeText={setFavoriteNameDraft}
              placeholder={defaultFavoriteDisplayName()}
              autoFocus
              maxLength={60}
            />
            <View style={styles.nameModalActions}>
              <Pressable
                style={styles.nameModalCancel}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.nameModalCancelText}>Avbryt</Text>
              </Pressable>
              <Pressable
                style={styles.nameModalSave}
                onPress={confirmSaveFavorite}
              >
                <Text style={styles.nameModalSaveText}>Spara</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  challengeResult: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  challengeResultWin: {
    backgroundColor: 'rgba(62, 122, 68, 0.15)',
  },
  challengeResultLose: {
    backgroundColor: 'rgba(185, 28, 28, 0.08)',
  },
  challengeResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  challengeResultBody: {
    fontSize: 14,
    color: '#4a5763',
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: '#fdecea',
  },
  secondaryButtonText: {
    color: '#2f7a3f',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButtonTextSaved: {
    color: '#c62828',
  },
  nameModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  nameModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  nameModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  nameModalHint: {
    fontSize: 14,
    color: '#5f6b72',
    marginBottom: 14,
  },
  nameModalInput: {
    borderWidth: 1,
    borderColor: '#d0d8dc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 18,
  },
  nameModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  nameModalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  nameModalCancelText: {
    fontSize: 16,
    color: '#5f6b72',
    fontWeight: '600',
  },
  nameModalSave: {
    backgroundColor: '#2f7a3f',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nameModalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});

async function resolveSavedRouteRecord(
  routeSnapshot: RouteResponse,
  existingRouteId: string | null,
  setSavedRouteId: (id: string) => void
): Promise<SavedRouteRecord> {
  if (existingRouteId) {
    try {
      return await getRouteRecord(existingRouteId);
    } catch {
      return savedRouteFromSnapshot(existingRouteId, routeSnapshot);
    }
  }
  const saved = await savePersistedRoute(routeSnapshot);
  setSavedRouteId(saved._id);
  return saved;
}

function savedRouteFromSnapshot(
  routeId: string,
  routeSnapshot: RouteResponse
): SavedRouteRecord {
  return {
    _id: routeId,
    start: routeSnapshot.start,
    distance: routeSnapshot.distance,
    checkpoints: routeSnapshot.checkpoints.map(
      ({ id, coordinate, radius }) => ({
        id,
        coordinate,
        radius,
      })
    ),
  };
}
