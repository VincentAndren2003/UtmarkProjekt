import { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Checkbox from 'expo-checkbox';
import { RootStackParamList } from '../../App';
import { signup } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;

export function CreateAccountScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.main}>
        <Pressable onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backLink}>← Tillbaka</Text>
        </Pressable>
        <View style={styles.infoBlock}>
          <Text style={styles.infoHeaderLabel}>Skapa ett konto</Text>
          <Text style={styles.infoSubText}>
            Det tar under en minut och är helt gratis
          </Text>
        </View>
        <View style={styles.inputBlock}>
          <TextInput
            placeholder="Användarnamn"
            autoCapitalize="none"
            style={styles.inputContainer}
          />

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.inputContainer}
          />

          <TextInput
            placeholder="Skapa lösenord"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.inputContainer}
          />

          <TextInput
            placeholder="Upprepa lösenord"
            secureTextEntry
            //value={password}
            //onChangeText={setPassword}
            style={styles.inputContainer}
          />
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAcceptTerms((prev) => !prev)}
          >
            <Checkbox
              value={acceptTerms}
              onValueChange={setAcceptTerms}
              color={acceptTerms ? 'rgba(223, 230, 233, 1)' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>Jag godkänner villkoren</Text>
          </Pressable>
        </View>
        <View style={styles.buttonBlock}>
          <Pressable style={styles.primaryButton} onPress={handleSignUp}>
            {!!msg && <Text style={styles.errorText}>{msg}</Text>}
            <Text style={styles.buttonText}>Skapa konto</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(28, 58, 42, 0)',
    alignItems: 'center',
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

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkbox: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(223, 230, 233, 1)',
  },

  checkboxLabel: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 13,
    fontWeight: '400',
  },

  helpText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
  },

  errorText: {
    color: 'rgba(255, 0, 0, 1)',
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
