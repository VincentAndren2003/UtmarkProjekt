import { useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckpointTaken'>;

export function CheckpointTakenScreen({ navigation, route }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const {
    routeName,
    currentCheckpoint,
    totalCheckpoints,
    elapsedMin,
    distanceKm,
    paceMinPerKm,
    isLastCheckpoint = false,
  } = route.params;
  const paceDisplayValue = paceMinPerKm.includes('/')
    ? paceMinPerKm.split('/')[0]
    : paceMinPerKm;
  const visibleCheckpointSlots = 4;
  const progressHorizontalOffset = 40;
  const progressViewportWidth = Math.max(
    Math.min(windowWidth - 120, 260) - progressHorizontalOffset,
    140
  );
  const progressSegmentWidth = progressViewportWidth / visibleCheckpointSlots;

  const checkpointsLeft = Math.max(0, totalCheckpoints - currentCheckpoint);
  const nextDistanceMeters = 500;
  const progressData = useMemo(
    () =>
      Array.from({ length: totalCheckpoints }, (_, index) => ({
        id: `checkpoint-${index + 1}`,
        number: index + 1,
      })),
    [totalCheckpoints]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.centerWrap}>
        <View style={styles.glowLayer} pointerEvents="none">
          <View style={styles.gradientGlowOuter} />
          <View style={styles.gradientGlow} />
        </View>
        <View style={styles.content}>
          <View style={styles.checkWrap}>
            <View style={styles.checkInner}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>

          <Text style={styles.title}>
            {isLastCheckpoint
              ? 'Sista checkpointen tagen!'
              : `Checkpoint ${currentCheckpoint} tagen!`}
          </Text>
          <Text style={styles.subtitle}>
            {isLastCheckpoint
              ? 'Gå tillbaka till kartan och tryck Avsluta rutt när du är klar.'
              : 'Fortsätt mot nästa kontroll!'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.progressTitle}>Framsteg</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.progressViewport, { width: progressViewportWidth }]}
            contentContainerStyle={[
              styles.progressTrack,
              progressData.length <= visibleCheckpointSlots
                ? styles.progressTrackCentered
                : null,
            ]}
          >
            {progressData.map((item, index) => {
              const isDone = isLastCheckpoint
                ? true
                : item.number < currentCheckpoint;
              const isCurrent =
                !isLastCheckpoint && item.number === currentCheckpoint;
              const isLast = index === progressData.length - 1;

              return (
                <View
                  key={item.id}
                  style={[styles.progressItem, { width: progressSegmentWidth }]}
                >
                  <View style={styles.progressTopRow}>
                    <View
                      style={[
                        styles.progressDot,
                        isDone && styles.progressDotDone,
                        isCurrent && styles.progressDotCurrent,
                      ]}
                    >
                      {isDone ? (
                        <Text style={styles.progressCheck}>✓</Text>
                      ) : null}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.progressLine,
                          { width: Math.max(progressSegmentWidth - 20, 8) },
                          isDone && styles.progressLineDone,
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.progressNumber,
                      isCurrent && styles.progressNumberCurrent,
                    ]}
                  >
                    {item.number}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tid</Text>
              <Text style={styles.statValue}>{elapsedMin}</Text>
              <Text style={styles.statUnit}>min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distans</Text>
              <Text style={styles.statValue}>{distanceKm}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Snitt</Text>
              <Text style={styles.statValue}>{paceDisplayValue}</Text>
              <Text style={styles.statUnit}>/km</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {isLastCheckpoint ? (
            <>
              <Text style={styles.progressTakenLabel}>
                {totalCheckpoints} / {totalCheckpoints} checkpoints tagna
              </Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>Ett steg kvar</Text>
                <Text style={styles.instructionBody}>
                  Gå tillbaka till kartan. När du är redo trycker du{' '}
                  <Text style={styles.instructionEmphasis}>Avsluta rutt</Text>{' '}
                  för att se resultat och spara rutten.
                </Text>
              </View>
              <Text style={styles.hintText}>
                Tid och distans är låsta. Du kan fortfarande navigera på kartan
                innan du avslutar.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.nextTitle}>Nästa checkpoint</Text>
              <Text style={styles.nextDistance}>{nextDistanceMeters} m</Text>
              <Text style={styles.leftText}>
                {checkpointsLeft} checkpoints kvar till mål
              </Text>
            </>
          )}

          <Pressable
            style={styles.cta}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }
              navigation.navigate('CreateRoute');
            }}
          >
            <Text style={styles.ctaText}>
              {isLastCheckpoint ? 'Tillbaka till kartan →' : 'Fortsätt rutt →'}
            </Text>
          </Pressable>

          <Text style={styles.routeName}>{routeName}</Text>
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
    paddingHorizontal: 24,
    position: 'relative',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#d8eddc',
    opacity: 0.55,
  },
  gradientGlowOuter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#eef6f0',
    opacity: 0.7,
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  checkWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(47, 122, 63, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  checkInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '400',
    marginTop: -2,
  },
  title: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#3d6b47',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e8e2',
    marginVertical: 14,
  },
  progressTitle: {
    color: '#5f7a66',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  progressViewport: {
    alignSelf: 'center',
    overflow: 'hidden',
    marginLeft: 40,
    marginRight: 40,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressTrackCentered: {
    justifyContent: 'center',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#c5d4c8',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotDone: {
    borderColor: '#2f7a3f',
    backgroundColor: '#2f7a3f',
  },
  progressDotCurrent: {
    borderColor: '#c94bc4',
    backgroundColor: '#fae8f9',
  },
  progressCheck: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#d0ddd4',
  },
  progressLineDone: {
    backgroundColor: '#6ea97b',
  },
  progressNumber: {
    color: '#7a8f80',
    fontSize: 12,
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },
  progressNumberCurrent: {
    color: '#b83eb3',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 68,
    backgroundColor: '#e0e8e2',
  },
  statLabel: {
    color: '#5f7a66',
    fontSize: 14,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    color: '#1a1a1a',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 46,
  },
  statUnit: {
    color: '#5f7a66',
    fontSize: 16,
    fontWeight: '500',
  },
  nextTitle: {
    color: '#5f7a66',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 34,
  },
  nextDistance: {
    color: '#111111',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 58,
    marginTop: 0,
  },
  leftText: {
    color: '#5f7a66',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 20,
  },
  progressTakenLabel: {
    color: '#3d6b47',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 14,
  },
  instructionBox: {
    backgroundColor: '#eef6f0',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
  },
  instructionTitle: {
    color: '#2f7a3f',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionBody: {
    color: '#3d5344',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
  },
  instructionEmphasis: {
    fontWeight: '800',
    color: '#2f7a3f',
  },
  hintText: {
    color: '#8a9a8e',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 18,
  },
  cta: {
    height: 60,
    borderRadius: 22,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  routeName: {
    color: '#8a9a8e',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 12,
  },
});
