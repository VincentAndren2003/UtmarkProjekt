import { Button, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

<<<<<<< HEAD
type Props = {
  onGoWelcome: () => void;
  onGoMap: () => void;
};

export function HomeScreen({ onGoWelcome, onGoMap }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utmark</Text>
      <Text style={styles.subtitle}>Expo + TypeScript is ready.</Text>
      <Text style={styles.hint}>
        Add screens under src/screens and wire navigation next.
      </Text>
      <View style={styles.buttonWrap}>
        <Button title="Next" onPress={onGoWelcome} />
        <Button title="Map" onPress={onGoMap} />
      </View>
=======
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button
        title="Go to Create Account"
        onPress={() => navigation.navigate('CreateAccount')}
      />
      <Button
        title="Already have an account? Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
>>>>>>> f69ad4d (feat/add-login-screen)
    </View>
  );
}
