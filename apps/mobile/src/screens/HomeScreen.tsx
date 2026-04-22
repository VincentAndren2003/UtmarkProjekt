import { Button, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

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
    </View>
  );
}
