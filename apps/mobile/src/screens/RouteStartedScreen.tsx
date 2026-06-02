import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';
import { RouteResponse } from '../types/route';

type Props = NativeStackScreenProps<RootStackParamList, 'RouteStarted'>;

function estimateMinutes(distanceKm: number) {
  const raw = Math.max(1, Math.round(distanceKm * 11));
  return Math.round(raw / 5) * 5;
}

export function RouteStartedScreen({ navigation, route }: Props) {
  const generatedRoute = route.params.route;
  const routeName =
    (generatedRoute as RouteResponse & { name?: string }).name ??
    'Genererad rutt';
  const etaMin = estimateMinutes(generatedRoute.distance);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.centerWrap}>
        <View style={styles.glowLayer} pointerEvents="none">
          <View style={styles.gradientGlowOuter} />
          <View style={styles.gradientGlow} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Rutten har startat!</Text>
          <Text style={styles.subtitle}>
            {routeName} · {generatedRoute.distance} km ·{' '}
            {generatedRoute.checkpoints.length} checkpoints
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distans</Text>
              <Text style={styles.statValue}>{generatedRoute.distance} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Checkpoints</Text>
              <Text style={styles.statValue}>
                {generatedRoute.checkpoints.length} st
              </Text>
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
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Öppna kartvy →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerWrap: {
    width: '100%',
    paddingHorizontal: 18,
    position: 'relative',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#d8eddc',
    opacity: 0.55,
  },
  gradientGlowOuter: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: '#eef6f0',
    opacity: 0.7,
  },
  content: {
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#3d6b47',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2ebe4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#2f7a3f',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#5f7a66',
    marginBottom: 4,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e0e8e2',
  },
  hint: {
    textAlign: 'center',
    color: '#5c6860',
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
