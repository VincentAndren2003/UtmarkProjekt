import { useState } from 'react';
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.main}>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backLink}>← Tillbaka</Text>
        </Pressable>

        <View style={styles.infoBlock}>
          <Text style={styles.infoHeaderLabel}>Välkommen!</Text>
          <Text style={styles.infoSubText}>
            Vänligen logga in eller skapa ett konto
          </Text>
        </View>

        <View style={styles.inputBlock}>
          <TextInput style={styles.inputContainer} placeholder="Användarnamn" />
          <TextInput style={styles.inputContainer} placeholder="Lösenord" />
          <Text style={[styles.helpText, { textAlign: 'right' }]}>
            Glömt lösenord?
          </Text>
        </View>

        <View style={styles.buttonBlock}>
          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Logga in</Text>
          </Pressable>
          <Text style={[styles.helpText, { textAlign: 'center' }]}>
            Har du inget konto? Skapa konto
          </Text>
        </View>
      </View>
    </View>
    /*
    <View style={styles.container}>
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
    */
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
  },

  main: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },

  infoBlock: {
    gap: 12,
  },

  infoHeaderLabel: {
    color: 'rgba(26, 26, 26, 1)',
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'normal',
    textAlign: 'left',
  },

  infoSubText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
  },

  inputBlock: {
    gap: 12,
    alignSelf: 'center',
  },

  inputContainer: {
    width: 334,
    height: 46,
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: 'rgba(223, 230, 233, 1)',
    color: 'rgba(26, 26, 26, 0.5)',
    padding: 10,
  },

  helpText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
  },

  buttonBlock: {
    gap: 14,
    alignSelf: 'center',
  },

  buttonText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'normal',
  },

  primaryButton: {
    width: 280,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#3E7A44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
});
