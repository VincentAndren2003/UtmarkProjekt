import { Button, StyleSheet, Text, View } from 'react-native';

type Props = {
  onGoWelcome: () => void;
};

export function HomeScreen({ onGoWelcome }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utmark</Text>
      <Text style={styles.subtitle}>Expo + TypeScript is ready.</Text>
      <Text style={styles.hint}>
        Add screens under src/screens and wire navigation next.
      </Text>
      <View style={styles.buttonWrap}>
        <Button title="Next" onPress={onGoWelcome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonWrap: {
    marginTop: 20,
    minWidth: 140,
  },
});
