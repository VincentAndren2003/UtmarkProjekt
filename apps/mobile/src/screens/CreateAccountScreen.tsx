import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { signUpWithEmail } from '../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>; // Means that the component is the createAccount route in our stack / navigation stack

export function CreateAccountScreen({ navigation }: Props) {
  // const [username, setUsername] = useState(''); // Usestate = gives the component memory between renders

  const [email, setEmail] = useState(''); // Usestate = gives the component memory between renders
  const [password, setPassword] = useState(''); // paswword in this context means the current text in password input
  const [msg, setMsg] = useState(''); // When a setter runs, React rerenders with new values, it replaces them not adds on to them!

  const handleSignUp = async () => {
    // Uses async which allows us to use await inside it, which allows us to wait for the function to complete before moving on to the next line!
    // is very important because it is a network request
    const { error } = await signUpWithEmail(email.trim(), password); // calls the signupwithemail function in supabase.ts

    if (error) {
      setMsg(error.message);
      return;
    }

    navigation.replace('Welcome'); // navigates to the welcome screen after creating an account and after successful signup because of await and error handling!
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
    // shows error text only when msg is not empty!
  );
}
