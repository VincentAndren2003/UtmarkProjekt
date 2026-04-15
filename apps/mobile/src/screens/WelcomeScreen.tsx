import { Button, StyleSheet, View, Text } from 'react-native';

type Props = {
  onBack: () => void;
};

export function WelcomeScreen({ onBack }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to the app</Text>
      <Text style={styles.tag}>Vincent was here</Text>
      <Button title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tag: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
