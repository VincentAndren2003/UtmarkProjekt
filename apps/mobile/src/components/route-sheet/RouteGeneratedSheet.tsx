import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteResponse } from '../../types/route';

type Props = {
  route: RouteResponse;
  onStartOrienteering?: () => void;
  onGenerateNew: () => void;
  onBackToRequest: () => void;
};

export function RouteGeneratedSheet({
  route,
  onStartOrienteering,
  onGenerateNew,
  onBackToRequest,
}: Props) {
  const routeName = (route as RouteResponse & { name?: string }).name ?? 'Genererad rutt';

  return (
    <>
      <View style={styles.handleBlock}>
        <Text style={styles.greeting}>Din rutt</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.routeName}>{routeName}</Text>
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

      <Text style={styles.terrainTitle}>Terränginfo</Text>
      <View style={styles.terrainRow}>
        <View style={styles.terrainItem}>
          <Text style={styles.terrainLabel}>Underlag</Text>
          <Text style={styles.terrainValue}>Grusig stig</Text>
        </View>
        <View style={styles.terrainDivider} />
        <View style={styles.terrainItem}>
          <Text style={styles.terrainLabel}>Lutning</Text>
          <Text style={styles.terrainValue}>+80 m</Text>
        </View>
        <View style={styles.terrainDivider} />
        <View style={styles.terrainItem}>
          <Text style={styles.terrainLabel}>Terräng</Text>
          <Text style={styles.terrainValue}>Blandskog</Text>
        </View>
        <View style={styles.terrainDivider} />
        <View style={styles.terrainItem}>
          <Text style={styles.terrainLabel}>Vatten</Text>
          <Text style={styles.terrainValue}>Längs stig</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton} onPress={onStartOrienteering}>
          <Text style={styles.primaryButtonText}>▶ Starta orientering</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onGenerateNew}>
          <Text style={styles.secondaryButtonText}>Slumpa ny rutt</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={onBackToRequest}>
          <Text style={styles.backButtonText}>Tillbaka till val</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handleBlock: {
    marginBottom: 18,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e1e5ea',
    marginHorizontal: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  statItem: {
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  statLabel: {
    fontSize: 16,
    color: '#444',
  },
  statDivider: {
    width: 1,
    height: 52,
    backgroundColor: '#b8c0c8',
    marginHorizontal: 22,
  },
  terrainTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
  },
  terrainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  terrainItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  terrainLabel: {
    fontSize: 13,
    color: '#222',
    marginBottom: 2,
  },
  terrainValue: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  terrainDivider: {
    width: 1,
    height: 56,
    alignSelf: 'center',
    backgroundColor: '#e1e5ea',
    marginHorizontal: 10,
  },
  actionsRow: {
    gap: 12,
  },
  backButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#f0f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#25313a',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2f7a3f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e7eeea',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#233127',
    fontSize: 16,
    fontWeight: '600',
  },
});
