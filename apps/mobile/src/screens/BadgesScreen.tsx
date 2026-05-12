import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BADGES } from '../data/badges';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

export function BadgesScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Tillbaka"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.title}>Badges</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {BADGES.map((badge) => (
          <View key={badge.id} style={styles.row}>
            {badge.unlocked && badge.image ? (
              <Image source={badge.image} style={styles.image} />
            ) : (
              <View style={styles.icon}>
                <Ionicons name="lock-closed" size={28} color="#9aa1a8" />
              </View>
            )}
            <View style={styles.textBlock}>
              <Text style={styles.name} numberOfLines={1}>
                {badge.name}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {badge.description}
              </Text>
              <Text style={styles.status}>
                {badge.unlocked ? 'Upplåst' : 'Ej upplåst'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f7f8f9',
    borderRadius: 16,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ececee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 13,
    color: '#525860',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9aa1a8',
    marginTop: 6,
  },
});
