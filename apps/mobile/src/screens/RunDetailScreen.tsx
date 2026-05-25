import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  createRouteChallenge,
  Friend,
  getFriends,
  SavedRouteRecord,
} from '../lib/api';
import { trackPointsToPolyline } from '../utils/trackUtils';
import { CustomMapStyle } from '../models/CustomMapStyle';

type Props = NativeStackScreenProps<RootStackParamList, 'RunDetail'>;

function isSavedRoute(
  route: Props['route']['params']['run']['route']
): route is SavedRouteRecord {
  return typeof route === 'object' && route !== null && '_id' in route;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds?: number) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function friendDisplayName(friend: Friend): string {
  if (friend.fullName?.trim()) return friend.fullName.trim();
  return friend.username ? `@${friend.username}` : 'Vän';
}

export function RunDetailScreen({ navigation, route }: Props) {
  const { run } = route.params;
  const savedRoute = isSavedRoute(run.route) ? run.route : null;
  const trackCoords = trackPointsToPolyline(run.trackPoints);
  const plannedCheckpoints = savedRoute?.checkpoints ?? [];

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [challengingId, setChallengingId] = useState<string | null>(null);

  const canChallenge =
    run.status === 'completed' &&
    savedRoute != null &&
    run.durationSeconds != null;

  useEffect(() => {
    if (!challengeModalVisible) return;
    let active = true;
    setFriendsLoading(true);
    (async () => {
      try {
        const data = await getFriends();
        if (!active) return;
        setFriends(data);
      } catch {
        if (!active) return;
        setFriends([]);
      } finally {
        if (active) setFriendsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [challengeModalVisible]);

  const initialRegion = useMemo(() => {
    if (trackCoords.length > 0) {
      const lats = trackCoords.map((c) => c.latitude);
      const lngs = trackCoords.map((c) => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.4),
        longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.4),
      };
    }
    if (savedRoute?.start) {
      return {
        latitude: savedRoute.start.latitude,
        longitude: savedRoute.start.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return {
      latitude: 59.334591,
      longitude: 18.06324,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [trackCoords, savedRoute]);

  const statusLabel =
    run.status === 'completed'
      ? 'Avklarad'
      : run.status === 'abandoned'
        ? 'Avbruten'
        : 'Pågår';

  const onChallengeFriend = async (friend: Friend) => {
    if (!savedRoute) return;
    setChallengingId(friend.userId);
    try {
      await createRouteChallenge({
        friendId: friend.userId,
        routeId: savedRoute._id,
        sourceRunId: run._id,
      });
      Alert.alert(
        'Utmaning skickad',
        `${friendDisplayName(friend)} kan nu köra samma rutt och försöka slå din tid ${formatDurationClock(run.durationSeconds)}.`
      );
      setChallengeModalVisible(false);
    } catch (err) {
      Alert.alert(
        'Kunde inte skicka utmaning',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setChallengingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Tillbaka"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.title}>Körning</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.metaTitle}>
          {savedRoute?.distance ?? '—'} km · {statusLabel}
        </Text>
        <Text style={styles.metaSub}>
          {formatDate(run.finishedAt ?? run.startedAt)} · Tid{' '}
          {formatDuration(run.durationSeconds)} ·{' '}
          {run.checkpointsCompleted ?? 0} checkpoints
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        customMapStyle={CustomMapStyle}
        showsBuildings={false}
        showsCompass={false}
      >
        {trackCoords.length > 1 && (
          <Polyline
            coordinates={trackCoords}
            strokeColor="#2f7a3f"
            strokeWidth={4}
          />
        )}
        {plannedCheckpoints.map((cp, index) => (
          <Marker
            key={cp.id}
            coordinate={{
              latitude: cp.coordinate.latitude,
              longitude: cp.coordinate.longitude,
            }}
            title={`Checkpoint ${index + 1}`}
            pinColor="#BA55A0"
          />
        ))}
        <UrlTile
          urlTemplate={'http://79.76.60.222:3000/tiles/{z}/{x}/{y}.png'}
          maximumZ={20}
          minimumZ={12}
          shouldReplaceMapContent={false}
          tileSize={512}
          zIndex={1}
        />
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#2f7a3f' }]} />
          <Text style={styles.legendText}>Ditt gångspår</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#BA55A0' }]} />
          <Text style={styles.legendText}>Planerade checkpoints</Text>
        </View>
      </View>

      {canChallenge ? (
        <Pressable
          style={styles.challengeButton}
          onPress={() => setChallengeModalVisible(true)}
        >
          <Ionicons name="trophy-outline" size={20} color="#fff" />
          <Text style={styles.challengeButtonText}>Utmana vän</Text>
        </Pressable>
      ) : null}

      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setChallengeModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Välj vän att utmana</Text>
              <Pressable onPress={() => setChallengeModalVisible(false)}>
                <Ionicons name="close" size={26} color="#1a1a1a" />
              </Pressable>
            </View>
            <Text style={styles.modalHint}>
              Din tid att slå: {formatDurationClock(run.durationSeconds)}
            </Text>
            {friendsLoading ? (
              <ActivityIndicator color="#3E7A44" style={{ marginTop: 24 }} />
            ) : friends.length === 0 ? (
              <Text style={styles.modalEmpty}>
                Du har inga vänner ännu. Lägg till vänner under Profil.
              </Text>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => {
                  const busy = challengingId === item.userId;
                  return (
                    <Pressable
                      style={styles.friendPickRow}
                      disabled={busy}
                      onPress={() => onChallengeFriend(item)}
                    >
                      <View style={styles.friendPickAvatar}>
                        <Ionicons name="person" size={24} color="#b8bec5" />
                      </View>
                      <Text style={styles.friendPickName}>
                        {friendDisplayName(item)}
                      </Text>
                      {busy ? (
                        <ActivityIndicator color="#3E7A44" />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9ca3af"
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  metaCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#f4f6f4',
    borderRadius: 12,
  },
  metaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metaSub: {
    fontSize: 14,
    color: '#5c636a',
  },
  map: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  legend: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#5c636a',
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3E7A44',
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalHint: {
    fontSize: 14,
    color: '#3E7A44',
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalEmpty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 24,
    fontSize: 15,
  },
  friendPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  friendPickAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendPickName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
