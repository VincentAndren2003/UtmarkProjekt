import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckpointTaken'>;

export function CheckpointTakenScreen({ navigation, route }: Props) {
  const { routeName, currentCheckpoint, totalCheckpoints, elapsedMin, distanceKm, paceMinPerKm } =
    route.params;

  const checkpointsLeft = Math.max(0, totalCheckpoints - currentCheckpoint);
  const nextDistanceMeters = 500;

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <View style={styles.checkWrap}>
          <View style={styles.checkInner}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Checkpoint {currentCheckpoint} tagen!</Text>
        <Text style={styles.subtitle}>Fortsätt mot nästa kontroll!</Text>

        <View style={styles.divider} />

        <Text style={styles.progressTitle}>Framsteg</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressDotDone]} />
          <View style={[styles.progressLine, styles.progressLineDone]} />
          <View style={[styles.progressDot, styles.progressDotCurrent]} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
          <View style={styles.progressLine} />
          <View style={styles.progressDot} />
        </View>
        <View style={styles.progressNumbersRow}>
          <Text style={styles.progressNumber}>1</Text>
          <Text style={[styles.progressNumber, styles.progressNumberCurrent]}>2</Text>
          <Text style={styles.progressNumber}>3</Text>
          <Text style={styles.progressNumber}>4</Text>
        </View>

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

        <Text style={styles.nextTitle}>Nästa checkpoint</Text>
        <Text style={styles.nextDistance}>{nextDistanceMeters} m</Text>
        <Text style={styles.leftText}>{checkpointsLeft} checkpoints kvar till mål</Text>

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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 30,
    height: 2,
    backgroundColor: '#4d5a50',
  },
  progressLineDone: {
    backgroundColor: '#6ea97b',
  },
  progressNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 44,
    marginBottom: 2,
  },
  progressNumber: {
    color: '#6f8c75',
    fontSize: 12,
    fontWeight: '600',
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

