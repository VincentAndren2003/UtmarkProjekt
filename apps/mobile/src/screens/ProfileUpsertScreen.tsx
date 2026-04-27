import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { getMyProfile } from '../services/supabase';
import { upsertMyProfile } from '../services/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileUpsert'>;
type Gender = 'male' | 'female' | 'other';

export function ProfileUpsertScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('other');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // May be moved into hooks if we use this more than once !!!!!
  useEffect(() => {
    const checkProfile = async () => {
      const { data, error } = await getMyProfile();

      if (!error && data) {
        navigation.navigate('Welcome');
        return;
      }
      setLoading(false); // Setloading means a spinning loading wheel which tells us that false = no profile exist yet need to fill out.
    };
    checkProfile();
  }, [navigation]); // Dependency array, tells react not not rerun this funtion when navigation changes otherwise it will loop forever.

  const onSave = async () => {
    const { error } = await upsertMyProfile({
      username: username.trim(),
      full_name: fullname.trim(),
      age: parseInt(age.trim()),
      gender,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    navigation.navigate('Welcome');
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
      />
      <Text style={styles.genderButtonText}>Selected gender: {gender}</Text>

      {saving && <ActivityIndicator style={styles.loading} />}

      <Button title="Male" onPress={() => setGender('male')} />
      <Button title="Female" onPress={() => setGender('female')} />
      <Button title="Other" onPress={() => setGender('other')} />

      <Button title="Save" onPress={onSave} />

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

  genderButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
  },
  genderButtonSelected: {
    backgroundColor: 'blue',
  },
  genderButtonText: {
    fontSize: 16,
    color: 'black',
  },

  loading: {
    marginTop: 10,
    marginBottom: 10,
    color: 'blue',
  },

  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// then if setloading true load fill profile upsert page and save button
