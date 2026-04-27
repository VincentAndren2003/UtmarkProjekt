import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { login } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    setMsg('');
    try {
      await login(email.trim().toLowerCase(), password);
      navigation.navigate('ProfileUpsert');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 10 }}>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      {!!msg && <Text>{msg}</Text>}
      <Button
        title="No account? Create one"
        onPress={() => navigation.navigate('CreateAccount')}
      />
    </View>
  );
}
