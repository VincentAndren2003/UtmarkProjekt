import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation, route }: Props) {
  const from = route.params?.from;
  const targetScreen = from === 'CreateAccount' ? 'CreateAccount' : 'Login';
  const targetLabel = from === 'CreateAccount' ? 'CreateAccount' : 'Login';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Favoriter</Text>
        <Text style={styles.subtitle}>Dina sparade rutter visas här.</Text>
        <Pressable
          style={styles.tempBackButton}
          onPress={() => navigation.navigate(targetScreen)}
        >
          <Text style={styles.tempBackText}>
            Temp: Tillbaka till {targetLabel}
          </Text>
        </Pressable>
      </View>
      <BottomNav
        navigation={navigation}
        activeTab="Favorites"
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
  tempBackButton: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 122, 68, 0.35)',
    backgroundColor: 'rgba(62, 122, 68, 0.08)',
  },
  tempBackText: {
    color: '#3E7A44',
    fontSize: 12,
    fontWeight: '600',
  },
});
