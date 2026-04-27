// style of the login screen

// Email type in container

// Password type in container

// Login button

// connect button to supabase

// Forgot password button

// Connect forgot password button to supabase

// Create account button - go to create account screen

// Then go to welcomescreen

//export function LoginScreen() {

import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { signInWithEmail } from '../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    setMsg('');
    const { error } = await signInWithEmail(
      email.trim().toLowerCase(),
      password
    );
    if (error) {
      setMsg(error.message);
      return;
    }
    navigation.navigate('ProfileUpsert');
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
