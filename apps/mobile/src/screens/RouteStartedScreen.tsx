import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { RouteResponse } from '../types/route';

type Props = NativeStackScreenProps<RootStackParamList, 'RouteStarted'>;

function estimateMinutes(distanceKm: number) {
  // Placeholder until backend provides ETA.
  // ~11 min/km, rounded to nearest 5.
  const raw = Math.max(1, Math.round(distanceKm * 11));
  return Math.round(raw / 5) * 5;
}

export function RouteStartedScreen({ navigation, route }: Props) {
  const generatedRoute = route.params.route;
  const routeName =
    (generatedRoute as RouteResponse & { name?: string }).name ?? 'Genererad rutt';
  const etaMin = estimateMinutes(generatedRoute.distance);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Rutten har startat!</Text>
        <Text style={styles.subtitle}>
          {routeName} · {generatedRoute.distance} km · {generatedRoute.checkpoints.length}{' '}
          checkpoints
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distans</Text>
            <Text style={styles.statValue}>{generatedRoute.distance} km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Checkpoints</Text>
            <Text style={styles.statValue}>{generatedRoute.checkpoints.length} st</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Est. tid</Text>
            <Text style={styles.statValue}>~{etaMin} min</Text>
          </View>
        </View>

        <Text style={styles.hint}>Gå till kartvyn för att navigera</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('CreateRoute', { activeRoute: generatedRoute } as never)
          }
        >
          <Text style={styles.primaryButtonText}>Öppna kartvy →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#172016',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8fb693',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7aa681',
    marginBottom: 4,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  hint: {
    textAlign: 'center',
    color: '#d8e6da',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2f7a3f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

