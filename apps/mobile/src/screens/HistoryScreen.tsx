import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { getMyRuns, RunRecord, SavedRouteRecord } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

function isSavedRoute(route: RunRecord['route']): route is SavedRouteRecord {
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

function RunRow({ run, onPress }: { run: RunRecord; onPress: () => void }) {
  const savedRoute = isSavedRoute(run.route) ? run.route : null;
  const distanceKm = savedRoute?.distance ?? '—';
  const checkpoints = savedRoute?.checkpoints.length ?? '—';
  const hasTrack = (run.trackPoints?.length ?? 0) > 1;

  const statusLabel =
    run.status === 'completed'
      ? 'Avklarad'
      : run.status === 'abandoned'
        ? 'Avbruten'
        : 'Pågår';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{distanceKm} km</Text>
        <Text style={styles.statusBadge}>{statusLabel}</Text>
      </View>
      <Text style={styles.cardMeta}>
        {checkpoints} checkpoints ·{' '}
        {formatDate(run.finishedAt ?? run.startedAt)}
      </Text>
      <Text style={styles.cardMeta}>
        Tid {formatDuration(run.durationSeconds)} ·{' '}
        {run.checkpointsCompleted ?? 0} tagna
        {hasTrack ? ' · Spår sparat' : ''}
      </Text>
    </Pressable>
  );
}

export function HistoryScreen({ navigation }: Props) {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getMyRuns();
      setRuns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunde inte hämta historik');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRuns();
    }, [loadRuns])
  );

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
        <Text style={styles.title}>Historik</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2f7a3f" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadRuns()}>
            <Text style={styles.retryText}>Försök igen</Text>
          </Pressable>
        </View>
      ) : runs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.placeholder}>Inget att visa än.</Text>
          <Text style={styles.placeholderHint}>
            Avsluta en inloggad körning så sparas den här.
          </Text>
        </View>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRuns(true)}
            />
          }
          renderItem={({ item }) => (
            <RunRow
              run={item}
              onPress={() => navigation.navigate('RunDetail', { run: item })}
            />
          )}
        />
      )}
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
    paddingBottom: 16,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#f4f6f4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2f7a3f',
    backgroundColor: '#e2f0e4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardMeta: {
    fontSize: 14,
    color: '#5c636a',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 15,
    color: '#7c8189',
    textAlign: 'center',
  },
  placeholderHint: {
    fontSize: 13,
    color: '#9aa0a6',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#b42318',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2f7a3f',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
