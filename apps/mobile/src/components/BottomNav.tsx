import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';

type TabKey = 'CreateRoute' | 'Favorites' | 'Profile';

type BottomNavProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  activeTab: TabKey;
  fromOrigin?: 'Login' | 'CreateAccount';
};

export function BottomNav({ navigation, activeTab, fromOrigin }: BottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.line} />
      <View style={styles.row}>
        <Pressable
          style={styles.item}
          onPress={() => navigation.navigate('CreateRoute', { from: fromOrigin })}
        >
          <Ionicons
            name={activeTab === 'CreateRoute' ? 'home' : 'home-outline'}
            size={26}
            color={activeTab === 'CreateRoute' ? '#2b2f33' : '#7c8189'}
          />
          <Text style={[styles.label, activeTab === 'CreateRoute' && styles.activeText]}>
            Hem
          </Text>
        </Pressable>

        <Pressable
          style={styles.item}
          onPress={() => navigation.navigate('Favorites', { from: fromOrigin })}
        >
          <Ionicons
            name={activeTab === 'Favorites' ? 'heart' : 'heart-outline'}
            size={26}
            color={activeTab === 'Favorites' ? '#2b2f33' : '#7c8189'}
          />
          <Text style={[styles.label, activeTab === 'Favorites' && styles.activeText]}>
            Favoriter
          </Text>
        </Pressable>

        <Pressable
          style={styles.item}
          onPress={() => navigation.navigate('Profile', { from: fromOrigin })}
        >
          <Ionicons
            name={activeTab === 'Profile' ? 'person' : 'person-outline'}
            size={26}
            color={activeTab === 'Profile' ? '#2b2f33' : '#7c8189'}
          />
          <Text style={[styles.label, activeTab === 'Profile' && styles.activeText]}>
            Profil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingBottom: 26,
    backgroundColor: '#fff',
  },
  line: {
    height: 1,
    backgroundColor: '#ececec',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 86,
  },
  label: {
    fontSize: 14,
    color: '#7c8189',
  },
  activeText: {
    color: '#2b2f33',
    fontWeight: '700',
  },
});
