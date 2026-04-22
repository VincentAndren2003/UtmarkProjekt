import { Text, View } from 'react-native';

export function WelcomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        Welcome, nice you managed to create an account or logged in / Vincent
        was here!
      </Text>
    </View>
  );
}
