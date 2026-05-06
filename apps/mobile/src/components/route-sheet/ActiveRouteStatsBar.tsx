import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';

export type ActiveRouteStats = {
  timeMin: number;
  checkpointDone: number;
  checkpointTotal: number;
  distanceToNextM: number;
  paceMinPerKm: string;
};

type Props = {
  stats: ActiveRouteStats;
  variant?: 'sheet' | 'hud';
};

export function ActiveRouteStatsBar({ stats, variant = 'sheet' }: Props) {
  return (
    <View style={[styles.root, variant === 'hud' && styles.rootHud]}>
      <View style={styles.item}>
        <Text style={[styles.label, variant === 'hud' && styles.labelHud]}>
          Tid
        </Text>
        <Text style={[styles.value, variant === 'hud' && styles.valueHud]}>
          {stats.timeMin} min
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={[styles.label, variant === 'hud' && styles.labelHud]}>
          Checkpoint
        </Text>
        <Text style={[styles.value, variant === 'hud' && styles.valueHud]}>
          {stats.checkpointDone}/{stats.checkpointTotal}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={[styles.label, variant === 'hud' && styles.labelHud]}>
          Distans
        </Text>
        <Text style={[styles.value, variant === 'hud' && styles.valueHud]}>
          {stats.distanceToNextM} m
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={[styles.label, variant === 'hud' && styles.labelHud]}>
          Snitt
        </Text>
        <Text style={[styles.value, variant === 'hud' && styles.valueHud]}>
          {stats.paceMinPerKm}
        </Text>
      </View>
    </View>
  );
}

const HUD_TOP =
  (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) + 69;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rootHud: {
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 14,
    marginHorizontal: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    top: HUD_TOP,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    color: '#222',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  labelHud: {
    fontSize: 12,
    color: '#1f2933',
  },
  valueHud: {
    fontSize: 12,
    color: '#1f2933',
  },
  divider: {
    width: 1,
    height: 48,
    alignSelf: 'center',
    backgroundColor: '#e1e5ea',
    marginHorizontal: 10,
  },
});
