import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BadgeThumbnail } from '../components/BadgeThumbnail';
import { getBadgesForUser } from '../data/badges';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

export function BadgesScreen({ navigation }: Props) {
  const badges = getBadgesForUser();
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
        {badges.map((badge) => (
          <View key={badge.id} style={styles.row}>
            <BadgeThumbnail
              variant="list"
              unlocked={badge.unlocked}
              image={badge.image}
            />
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
