import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { OnboardingStepDots } from '../components/OnboardingStepDots';
import { Gender, getMyProfile, saveMyProfile } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileUpsert'>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Kvinna' },
  { value: 'other', label: 'Annat' },
];

function genderLabel(value: Gender): string {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function buildFullName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(' ').trim();
}

const MIN_AGE = 1;
const MAX_AGE = 120;
const DEFAULT_AGE_PICK = 25;

export function ProfileUpsertScreen({ navigation }: Props) {
  /** All new accounts go through CreateAccount → ProfileUpsert; no legacy login-without-profile path. */
  const flowFrom = 'CreateAccount' as const;

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [agePickerValue, setAgePickerValue] = useState(DEFAULT_AGE_PICK);
  const [gender, setGender] = useState<Gender | null>(null);
  const [genderSheetOpen, setGenderSheetOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getMyProfile();
        if (!cancelled) {
          navigation.replace('CreateRoute', { from: flowFrom });
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  const onSave = async () => {
    setMsg('');
    const u = username.trim();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const fullName = buildFullName(firstName, lastName);

    if (!u) {
      setMsg('Ange användarnamn.');
      return;
    }
    if (!fn || !ln) {
      setMsg('Ange både förnamn och efternamn.');
      return;
    }
    if (age === null) {
      setMsg('Välj ålder.');
      return;
    }
    if (age < MIN_AGE || age > MAX_AGE) {
      setMsg('Välj en giltig ålder.');
      return;
    }
    if (gender === null) {
      setMsg('Välj kön.');
      return;
    }

    setSaving(true);
    try {
      await saveMyProfile({
        username: u,
        fullName,
        age,
        gender,
      });
      navigation.replace('CreateRoute', { from: flowFrom });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Kunde inte spara profilen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator size="large" color="#3E7A44" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backLink}>← Tillbaka</Text>
        </Pressable>

        <View style={styles.infoBlock}>
          <Text style={styles.infoHeaderLabel}>Din profil</Text>
          <Text style={styles.infoSubText}>
            Fyll i uppgifterna nedan. Du kan uppdatera dem senare under fliken
            Profil.
          </Text>
        </View>

        <View style={styles.inputBlock}>
          <TextInput
            placeholder="Användarnamn"
            placeholderTextColor="rgba(26, 26, 26, 0.35)"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            style={styles.inputContainer}
          />

          <TextInput
            placeholder="Förnamn"
            placeholderTextColor="rgba(26, 26, 26, 0.35)"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.inputContainer}
          />

          <TextInput
            placeholder="Efternamn"
            placeholderTextColor="rgba(26, 26, 26, 0.35)"
            value={lastName}
            onChangeText={setLastName}
            style={styles.inputContainer}
          />

          <Pressable
            onPress={() => setGenderSheetOpen(true)}
            style={styles.inputContainer}
            accessibilityRole="button"
            accessibilityLabel="Välj kön"
          >
            <Text
              style={
                gender !== null ? styles.selectValue : styles.selectPlaceholder
              }
            >
              {gender !== null ? `Kön: ${genderLabel(gender)}` : 'Kön'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setAgePickerValue(age ?? DEFAULT_AGE_PICK);
              setAgeSheetOpen(true);
            }}
            style={styles.inputContainer}
            accessibilityRole="button"
            accessibilityLabel="Välj ålder"
          >
            <Text
              style={
                age !== null ? styles.selectValue : styles.selectPlaceholder
              }
            >
              {age !== null ? `Ålder: ${age} år` : 'Ålder'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.buttonBlock}>
          {!!msg && <Text style={styles.errorText}>{msg}</Text>}
          <Pressable
            style={[styles.primaryButton, saving && styles.primaryDisabled]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Fortsätt</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <OnboardingStepDots currentStep={2} />

      <Modal
        visible={genderSheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setGenderSheetOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setGenderSheetOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Välj kön</Text>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={styles.sheetOption}
                onPress={() => {
                  setGender(opt.value);
                  setGenderSheetOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    gender === opt.value && styles.sheetOptionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.sheetCloseButton}
              onPress={() => setGenderSheetOpen(false)}
            >
              <Text style={styles.sheetCloseButtonText}>Stäng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={ageSheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setAgeSheetOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setAgeSheetOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Välj ålder</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={agePickerValue}
                onValueChange={(v) => setAgePickerValue(Number(v))}
                style={styles.picker}
                itemStyle={styles.pickerItemIOS}
                mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                dropdownIconColor="rgba(26, 26, 26, 0.6)"
              >
                {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => {
                  const n = MIN_AGE + i;
                  return (
                    <Picker.Item
                      key={n}
                      label={`${n} år`}
                      value={n}
                      color={
                        Platform.OS === 'ios'
                          ? undefined
                          : 'rgba(26, 26, 26, 0.9)'
                      }
                    />
                  );
                })}
              </Picker>
            </View>
            <Pressable
              style={styles.sheetCloseButton}
              onPress={() => {
                setAge(agePickerValue);
                setAgeSheetOpen(false);
              }}
            >
              <Text style={styles.sheetCloseButtonText}>Klar</Text>
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
  loadingWrap: {
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 24,
    gap: 20,
  },
  infoBlock: {
    gap: 12,
  },
  infoHeaderLabel: {
    color: 'rgba(26, 26, 26, 1)',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'left',
  },
  infoSubText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 13,
    fontWeight: '400',
  },
  inputBlock: {
    gap: 12,
    alignSelf: 'center',
  },
  inputContainer: {
    width: 334,
    minHeight: 46,
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: 'rgba(223, 230, 233, 1)',
    color: 'rgba(26, 26, 26, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  selectValue: {
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.85)',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.35)',
  },
  buttonBlock: {
    gap: 14,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    width: 280,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#3E7A44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: 'rgba(255, 0, 0, 1)',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 280,
  },
  backLink: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 15,
    fontWeight: '500',
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
    marginBottom: 8,
  },
  sheetOption: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(26, 26, 26, 0.12)',
  },
  sheetOptionText: {
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.85)',
  },
  sheetOptionTextSelected: {
    color: '#3E7A44',
    fontWeight: '700',
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
  pickerWrap: {
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: 4,
  },
  picker: {
    width: '100%',
    ...(Platform.OS === 'ios'
      ? { height: 180 }
      : { height: 52, backgroundColor: 'rgba(241, 242, 244, 0.9)' }),
  },
  pickerItemIOS: {
    color: 'rgba(26, 26, 26, 0.95)',
    fontSize: 20,
  },
});
