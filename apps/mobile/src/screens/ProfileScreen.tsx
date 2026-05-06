import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation, route }: Props) {
  const from = route.params?.from;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Profilinställningar kommer här.</Text>
      </View>
      <BottomNav
        navigation={navigation}
        activeTab="Profile"
        fromOrigin={from}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
