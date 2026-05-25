import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EndpointPinVariant } from './EndpointPinMarker';

const PIN_COLORS: Record<EndpointPinVariant, string> = {
  start: '#2f7a3f',
  end: '#c0392b',
};

type Props = {
  label: string;
  bottomInset: number;
  variant: EndpointPinVariant;
};

/** Fast pin i kartans centrum medan användaren panorera/zoomar. */
export function PlacementTapHint({ label, bottomInset, variant }: Props) {
  const color = PIN_COLORS[variant];

  return (
    <View style={[styles.wrap, { bottom: bottomInset }]} pointerEvents="none">
      <View style={styles.tooltip}>
        <Text style={styles.tooltipText}>{label}</Text>
      </View>
      <View style={[styles.pinCircle, { borderColor: color }]}>
        <Ionicons name="location" size={28} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
