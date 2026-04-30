import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getMyProfile, saveMyProfile } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileUpsert'>;
type Gender = 'male' | 'female' | 'other';

export function ProfileUpsertScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('other');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        await getMyProfile();
        navigation.navigate('Welcome');
      } catch {
        // No profile yet (404) or unauthenticated; show form so user can fill it in
        setLoading(false);
      }
    };
    checkProfile();
  }, [navigation]);

  const onSave = async () => {
    setSaving(true);
    try {
      await saveMyProfile({
        username: username.trim(),
        fullName: fullname.trim(),
        age: parseInt(age.trim(), 10),
        gender,
      });
      navigation.navigate('Welcome');
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Could not save profile'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullname}
        onChangeText={setFullname}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
      />
      <Text style={styles.genderButtonText}>Selected gender: {gender}</Text>

      {saving && <ActivityIndicator style={styles.loading} />}

      <Button title="Male" onPress={() => setGender('male')} />
      <Button title="Female" onPress={() => setGender('female')} />
      <Button title="Other" onPress={() => setGender('other')} />

      <Button title="Save" onPress={onSave} disabled={saving} />

      {loading && <ActivityIndicator style={styles.loading} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  genderButtonText: {
    fontSize: 16,
    color: 'black',
  },
  loading: {
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
});
