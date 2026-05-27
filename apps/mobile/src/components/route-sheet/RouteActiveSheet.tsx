import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteResponse } from '../../types/route';
import { ActiveRouteStats, ActiveRouteStatsBar } from './ActiveRouteStatsBar';

type Props = {
  route: RouteResponse;
  terrain: ActiveRouteStats;
  onAbort: () => void;
  onEmergency: () => void;
  showUserPosition: boolean;
  onFetchCheckpoint: () => void;
  canFetchCheckpoint?: boolean;
  allCheckpointsTaken?: boolean;
  onFinishRoute?: () => void;
  isFinishingRoute?: boolean;
};

export function RouteActiveSheet({
  route,
  terrain,
  onAbort,
  onEmergency,
  showUserPosition,
  onFetchCheckpoint,
  canFetchCheckpoint = false,
  allCheckpointsTaken = false,
  onFinishRoute,
  isFinishingRoute = false,
}: Props) {
  const routeName =
    (route as RouteResponse & { name?: string }).name ?? 'Genererad rutt';

  const showFinish = allCheckpointsTaken;
  const fetchEnabled = showFinish || canFetchCheckpoint;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Din rutt</Text>
        <Text style={styles.subtitle}>{routeName}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{route.distance} km</Text>
          <Text style={styles.statLabel}>Längd</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{route.checkpoints.length}</Text>
          <Text style={styles.statLabel}>Checkpoints</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Terränginfo</Text>
      <ActiveRouteStatsBar stats={terrain} variant="sheet" />

      <Pressable
        style={[
          styles.fetchButton,
          !fetchEnabled && styles.fetchButtonDisabled,
          isFinishingRoute && styles.fetchButtonDisabled,
        ]}
        onPress={() => {
          if (showFinish) {
            onFinishRoute?.();
            return;
          }
          onFetchCheckpoint();
        }}
        disabled={!fetchEnabled || isFinishingRoute}
      >
        <Ionicons
          name={
            showFinish
              ? 'flag'
              : canFetchCheckpoint
                ? 'checkmark-circle'
                : 'lock-closed'
          }
          size={22}
          color="#fff"
          style={styles.fetchIcon}
        />
        <View style={styles.fetchTextWrap}>
          <Text style={styles.fetchText}>
            {showFinish ? 'Avsluta rutt' : 'Hämta checkpoint'}
          </Text>
          <Text style={styles.fetchSubtext}>
            {showFinish
              ? 'Se resultat och spara rutten'
              : canFetchCheckpoint
                ? 'Nu kan du hämta checkpointen!'
                : 'Tillgänglig när du når nästa plats'}
          </Text>
        </View>
        <Text style={styles.fetchArrow}>›</Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable style={styles.abortButton} onPress={onAbort}>
          <Text style={styles.abortText}>Avbryt rutt</Text>
        </Pressable>
        <Pressable style={styles.emergencyButton} onPress={onEmergency}>
          <Text style={styles.emergencyText}>
            {showUserPosition ? 'Dölj position' : 'Visa position'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  statLabel: {
    fontSize: 15,
    color: '#444',
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#b8c0c8',
    marginHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  abortButton: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dde5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abortText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#23313a',
  },
  emergencyButton: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7aa681',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  fetchButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#7aa681',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fetchButtonDisabled: {
    backgroundColor: '#a8aeb5',
  },
  fetchIcon: {
    marginRight: 12,
  },
  fetchTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  fetchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fetchSubtext: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  fetchArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginLeft: 8,
  },
});
