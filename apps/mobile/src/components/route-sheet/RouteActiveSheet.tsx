import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteResponse } from '../../types/route';
import { ActiveRouteStats, ActiveRouteStatsBar } from './ActiveRouteStatsBar';

type Props = {
  route: RouteResponse;
  terrain: ActiveRouteStats;
  onAbort: () => void;
  onEmergency: () => void;
  onFetchCheckpoint: () => void;
};

export function RouteActiveSheet({
  route,
  terrain,
  onAbort,
  onEmergency,
  onFetchCheckpoint,
}: Props) {
  const routeName =
    (route as RouteResponse & { name?: string }).name ?? 'Genererad rutt';

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

      <View style={styles.actionsRow}>
        <Pressable style={styles.abortButton} onPress={onAbort}>
          <Text style={styles.abortText}>Avbryt rutt</Text>
        </Pressable>
        <Pressable style={styles.emergencyButton} onPress={onEmergency}>
          <Text style={styles.emergencyText}>Nödknapp</Text>
        </Pressable>
      </View>

      <Pressable style={styles.fetchButton} onPress={onFetchCheckpoint}>
        <Text style={styles.fetchText}>Hämta checkpoint</Text>
        <Text style={styles.fetchArrow}>›</Text>
      </Pressable>
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
    marginBottom: 12,
  },
  abortButton: {
    flex: 1,
    height: 40,
    borderRadius: 18,
    backgroundColor: '#dde5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#23313a',
  },
  emergencyButton: {
    flex: 1,
    height: 40,
    borderRadius: 18,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  fetchButton: {
    height: 36,
    borderRadius: 12,
    backgroundColor: '#7aa681',
    justifyContent: 'center',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fetchText: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  fetchArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});
