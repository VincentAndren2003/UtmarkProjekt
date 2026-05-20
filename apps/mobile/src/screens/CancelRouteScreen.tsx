import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { completeRun } from '../lib/api';
import { useTracking } from '../hooks/useTracking';
import { simplifyTrackPoints } from '../utils/trackUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CancelRoute'>;

export function CancelRouteScreen({ navigation, route }: Props) {
  const {
    routeName,
    totalCheckpoints,
    checkpointsCompleted,
    elapsedMin,
    distanceKm,
    paceMinPerKm,
    plannedDistanceKm,
    from,
    runId,
    elapsedSeconds = 0,
    distanceMeters = 0,
  } = route.params;

  const { stopTracking, getResults } = useTracking();
  const [cancelling, setCancelling] = useState(false);

  const confirmCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const { movement } = getResults();
      if (runId) {
        try {
          await completeRun(runId, {
            durationSeconds: elapsedSeconds,
            checkpointsCompleted: checkpointsCompleted,
            distanceMeters: distanceMeters,
            trackPoints: simplifyTrackPoints(movement),
            status: 'abandoned',
          });
        } catch (err) {
          console.warn('Kunde inte avsluta avbruten körning på servern:', err);
        }
      }
    } finally {
      stopTracking();
      setCancelling(false);
      navigation.navigate('CreateRoute', { from, runFinished: true });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.glowLayer} pointerEvents="none">
        <View style={styles.gradientGlowOuter} />
        <View style={styles.gradientGlow} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Vill du avsluta din rutt?</Text>
        <Text style={styles.subtitle}>
          Alla checkpoints är ännu inte tagna...
        </Text>

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
                  Checkpoints
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
          style={[styles.confirmButton, cancelling && styles.confirmDisabled]}
          onPress={confirmCancel}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Bekräfta och avbryt</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.continueButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.continueButtonText}>
            Tillbaka och fortsätt rutt →
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNav
        navigation={navigation}
        activeTab="CreateRoute"
        fromOrigin={from}
        onHomePress={confirmCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
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
  scroll: {
    flex: 1,
    zIndex: 1,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8a949c',
    textAlign: 'center',
    marginBottom: 28,
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
    marginBottom: 28,
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
  confirmButton: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dde5ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#23313a',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButton: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
