import { useEffect, useMemo, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckpointTaken'>;
type ProgressItem = { id: string; number: number };

/** Horizontal space per checkpoint (dot + connector to next checkpoint). */
const PROGRESS_SEGMENT_WIDTH = 86;

export function CheckpointTakenScreen({ navigation, route }: Props) {
  const {
    routeName,
    currentCheckpoint,
    totalCheckpoints,
    elapsedMin,
    distanceKm,
    paceMinPerKm,
  } = route.params;

  const checkpointsLeft = Math.max(0, totalCheckpoints - currentCheckpoint);
  const nextDistanceMeters = 500;
  const isRouteComplete = checkpointsLeft === 0;
  const progressRef = useRef<FlatList<ProgressItem>>(null);
  const progressData = useMemo(
    () =>
      Array.from({ length: totalCheckpoints }, (_, index) => ({
        id: `checkpoint-${index + 1}`,
        number: index + 1,
      })),
    [totalCheckpoints]
  );

  useEffect(() => {
    if (progressData.length === 0) return;
    const targetIndex = Math.min(
      Math.max(currentCheckpoint - 1, 0),
      progressData.length - 1
    );
    requestAnimationFrame(() => {
      progressRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      });
    });
  }, [currentCheckpoint, progressData]);

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <View style={styles.checkWrap}>
          <View style={styles.checkInner}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Checkpoint {currentCheckpoint} tagen!</Text>
        <Text style={styles.subtitle}>
          {isRouteComplete
            ? 'Bra jobbat, Du har tagit alla checkpoints!'
            : 'Fortsätt mot nästa kontroll!'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.progressTitle}>Framsteg</Text>
        <FlatList
          ref={progressRef}
          data={progressData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.progressListContent}
          getItemLayout={(_, index) => ({
            length: PROGRESS_SEGMENT_WIDTH,
            offset: PROGRESS_SEGMENT_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item, index }) => {
            const isDone = item.number < currentCheckpoint;
            const isCurrent = item.number === currentCheckpoint;
            const isLast = index === progressData.length - 1;

            return (
              <View style={styles.progressItem}>
                <View style={styles.progressTopRow}>
                  <View
                    style={[
                      styles.progressDot,
                      isDone && styles.progressDotDone,
                      isCurrent && styles.progressDotCurrent,
                    ]}
                  />
                  {!isLast && (
                    <View
                      style={[
                        styles.progressLine,
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
          }}
        />

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
            <Text style={styles.statValue}>{paceMinPerKm}</Text>
            <Text style={styles.statUnit}>/km</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.nextTitle}>
          {isRouteComplete ? 'Rutt avklarad!' : 'Nästa checkpoint'}
        </Text>
        {!isRouteComplete && (
          <Text style={styles.nextDistance}>{nextDistanceMeters} m</Text>
        )}
        <Text style={styles.leftText}>
          {checkpointsLeft} checkpoints kvar till mål
        </Text>

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
          <Text style={styles.ctaText}>Fortsätt rutt →</Text>
        </Pressable>

        <Text style={styles.routeName}>{routeName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#102115',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  checkWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(79, 178, 121, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  checkInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#2f7048',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#f2fff6',
    fontSize: 42,
    fontWeight: '400',
    marginTop: -2,
  },
  title: {
    color: '#f3fff6',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8fbe99',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(140, 177, 148, 0.28)',
    marginVertical: 14,
  },
  progressTitle: {
    color: '#95bca0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  progressListContent: {
    paddingHorizontal: 8,
  },
  progressItem: {
    width: PROGRESS_SEGMENT_WIDTH,
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4d5a50',
    backgroundColor: 'transparent',
  },
  progressDotDone: {
    borderColor: '#6ea97b',
  },
  progressDotCurrent: {
    borderColor: '#e051de',
  },
  progressLine: {
    flex: 1,
    height: 2,
    alignSelf: 'center',
    minWidth: 0,
    backgroundColor: '#4d5a50',
  },
  progressLineDone: {
    backgroundColor: '#6ea97b',
  },
  progressNumber: {
    color: '#6f8c75',
    fontSize: 12,
    fontWeight: '600',
    width: 20,
    textAlign: 'center',
  },
  progressNumberCurrent: {
    color: '#d65ad5',
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
    backgroundColor: 'rgba(140, 177, 148, 0.3)',
  },
  statLabel: {
    color: '#8fbe99',
    fontSize: 14,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    color: '#f1fff5',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 46,
  },
  statUnit: {
    color: '#8fbe99',
    fontSize: 16,
    fontWeight: '500',
  },
  nextTitle: {
    color: '#95bca0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 34,
  },
  nextDistance: {
    color: '#f2fff5',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 58,
    marginTop: 0,
  },
  leftText: {
    color: '#95bca0',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 20,
  },
  cta: {
    height: 60,
    borderRadius: 22,
    backgroundColor: '#3c8a49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#f3fff6',
    fontSize: 22,
    fontWeight: '800',
  },
  routeName: {
    color: '#6f8c75',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 12,
  },
});
