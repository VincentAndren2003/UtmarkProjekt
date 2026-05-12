import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Checkbox from 'expo-checkbox';
import { RootStackParamList } from '../../App';
import { OnboardingStepDots } from '../components/OnboardingStepDots';
import { signup } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;

const TERMS_TEXT = `Denna app är ett studentprojekt inom kursen PVT15 på Stockholms universitet. Genom att använda appen godkänner du följande:

Data: Vi samlar endast in personuppgifter såsom för- och efternamn, användarnamn och positionsdata för att kunna generera rutter och för att göra upplevelsen personligt anpassad.

Integritet: Din exakta position eller hemadress sparas aldrig permanent och delas aldrig med utomstående.

Lagring: All data hanteras endast inom ramen för projektet och raderas senast 2026-06-07.

Kontakt: Ansvariga för projektet är grupp 15_1.`;

export function CreateAccountScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const handleSignUp = async () => {
    setMsg('');
    try {
      await signup(email.trim(), password);
      navigation.replace('ProfileUpsert');
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
          <View style={styles.checkboxRow}>
            <Checkbox
              value={acceptTerms}
              onValueChange={setAcceptTerms}
              color={acceptTerms ? 'rgba(223, 230, 233, 1)' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.checkboxLabel}>
              Jag godkänner{' '}
              <Text
                style={styles.termsLink}
                onPress={() => setTermsVisible(true)}
              >
                användarvillkoren
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.buttonBlock}>
          <Pressable style={styles.primaryButton} onPress={handleSignUp}>
            {!!msg && <Text style={styles.errorText}>{msg}</Text>}
            <Text style={styles.buttonText}>Skapa konto</Text>
          </Pressable>
          <Pressable
            style={styles.tempRouteButton}
            onPress={() =>
              navigation.push('ProfileUpsert')
            }
          >
            <Text style={styles.tempRouteButtonText}>
              Temp: Gå till ProfileUpsert
            </Text>
          </Pressable>
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Har du redan konto? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Logga in</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.stepDotsSpacer}>
          <OnboardingStepDots currentStep={1} />
        </View>
      </View>
      <Modal
        visible={termsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setTermsVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Användarvillkor</Text>
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sheetBody}>{TERMS_TEXT}</Text>
            </ScrollView>
            <Pressable
              style={styles.sheetCloseButton}
              onPress={() => setTermsVisible(false)}
            >
              <Text style={styles.sheetCloseButtonText}>Stäng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 0,
  },

  stepDotsSpacer: {
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
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
    flexShrink: 1,
  },

  termsLink: {
    color: '#3E7A44',
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    alignItems: 'center',
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
  tempRouteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 122, 68, 0.35)',
    backgroundColor: 'rgba(62, 122, 68, 0.08)',
  },
  tempRouteButtonText: {
    color: '#3E7A44',
    fontSize: 12,
    fontWeight: '600',
  },
  backLink: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    color: 'rgba(26, 26, 26, 0.75)',
    fontSize: 15,
    fontWeight: '400',
  },
  loginLink: {
    color: 'rgba(26, 26, 26, 0.95)',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    maxHeight: '78%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(26, 26, 26, 0.15)',
    marginBottom: 18,
  },

  sheetTitle: {
    color: 'rgba(26, 26, 26, 1)',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
  },

  sheetScroll: {
    flexGrow: 0,
  },

  sheetScrollContent: {
    paddingBottom: 8,
  },

  sheetBody: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 14,
    lineHeight: 22,
  },

  sheetCloseButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#3E7A44',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
