import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { signup } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;

export function CreateAccountScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignUp = async () => {
    setMsg('');
    try {
      await signup(email.trim(), password);
      navigation.navigate('ProfileUpsert');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 10 }}>
      <TextInput
        placeholder="Användarnamn"
        autoCapitalize="none"
        //value={username} måste kopplas till supabase eller nått?
        //onChangeText={setUsername} måste kopplas till supabase eller nått?
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Skapa lösenord"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Upprepa lösenord"
        secureTextEntry
        //value={password}
        //onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
        }}
      />

      <Button title="Create Account" onPress={handleSignUp} />
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
