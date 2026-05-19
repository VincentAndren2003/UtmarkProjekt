import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type EndpointPinVariant = 'start' | 'end';

const PIN_COLORS: Record<EndpointPinVariant, string> = {
  start: '#2f7a3f',
  end: '#c0392b',
};

type Props = {
  variant: EndpointPinVariant;
  label?: string;
};

/** Grön (start) eller röd (slut) pin på kartan. */
export function EndpointPinMarker({ variant, label }: Props) {
  const color = PIN_COLORS[variant];

  return (
    <View style={styles.root} pointerEvents="none">
      {label ? (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{label}</Text>
        </View>
      ) : null}
      <View style={[styles.pinCircle, { borderColor: color }]}>
        <Ionicons name="location" size={28} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: 260,
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
