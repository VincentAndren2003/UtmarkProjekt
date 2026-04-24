import { Text, View, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightgreen',
      }}
    >
      <Text>
        Welcome, nice you managed to create an account or logged in / Vincent
        was here!
      </Text>
      <Button title="Go to Map" onPress={() => navigation.navigate('Map')} />
    </View>
  );
}
