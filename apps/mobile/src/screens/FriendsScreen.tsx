import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Friend, getFriends, removeFriend } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Friends'>;

// Formaterar friendsSince (ISO) till texter som i designen: "sedan 1 vecka", "sedan 2026".
function formatFriendsSinceLabel(isoDate: string | undefined): string {
  if (!isoDate) return 'Vänner';

  const since = new Date(isoDate);
  if (Number.isNaN(since.getTime())) return 'Vänner';

  const now = new Date();
  const diffMs = now.getTime() - since.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Vänner sedan idag';
  if (diffDays < 7) {
    return diffDays === 1
      ? 'Vänner sedan 1 dag'
      : `Vänner sedan ${diffDays} dagar`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 28) {
    return diffWeeks === 1
      ? 'Vänner sedan 1 vecka'
      : `Vänner sedan ${diffWeeks} veckor`;
  }

  return `Vänner sedan ${since.getFullYear()}`;
}

// Filtrerar listan lokalt på namn/användarnamn tills backend-sök finns.
function filterFriendsByQuery(friends: Friend[], query: string): Friend[] {
  const q = query.trim().toLowerCase();
  if (!q) return friends;

  return friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(q) ||
      friend.username.toLowerCase().includes(q)
  );
}

export function FriendsScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Ökas vid "Försök igen" så useEffect hämtar vänlistan på nytt.
  const [reloadNonce, setReloadNonce] = useState(0);

  // Hämtar vänlistan från backend (vid mount och vid reloadNonce).
  // setState körs bara efter await — undviker react-hooks/set-state-in-effect.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getFriends();
        if (!active) return;
        setFriends(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setFriends([]);
        setError(
          err instanceof Error ? err.message : 'Kunde inte hämta vänner'
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadNonce]);

  const onRetryLoad = () => {
    setLoading(true);
    setReloadNonce((n) => n + 1);
  };

  const visibleFriends = useMemo(
    () => filterFriendsByQuery(friends, searchQuery),
    [friends, searchQuery]
  );

  // Tre-prick-menyn: ta bort vän (fungerar mot befintligt DELETE-endpoint).
  const onFriendMenuPress = (friend: Friend) => {
    Alert.alert(friend.fullName, undefined, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort vän',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(friend.userId);
            setFriends((prev) =>
              prev.filter((f) => f.userId !== friend.userId)
            );
          } catch (err) {
            Alert.alert(
              'Kunde inte ta bort',
              err instanceof Error ? err.message : 'Försök igen senare.'
            );
          }
        },
      },
    ]);
  };

  const renderFriendRow = ({ item }: { item: Friend }) => (
    <Pressable
      style={({ pressed }) => [
        styles.friendRow,
        pressed && styles.friendRowPressed,
      ]}
      onPress={() => {
        // TODO: Navigera till väns profil när vi har en skärm för andras profiler.
      }}
    >
      <View style={styles.avatar}>
        {/* TODO: visa friend.avatarUrl när profilbilder sparas i backend. */}
        <Ionicons name="person" size={28} color="#b8bec5" />
      </View>

      <View style={styles.friendTextBlock}>
        <Text style={styles.friendName} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={styles.friendMeta} numberOfLines={1}>
          {formatFriendsSinceLabel(item.friendsSince)}
        </Text>
      </View>

      <Pressable
        style={styles.menuButton}
        hitSlop={8}
        accessibilityLabel={`Alternativ för ${item.fullName}`}
        onPress={() => onFriendMenuPress(item)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Tillbaka"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={20}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök efter personer i Utmark"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          // TODO: Ersätt lokal filtrering med backend-sök (nya användare att lägga till som vän).
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Text style={styles.sectionTitle}>Vänner</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3E7A44" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={onRetryLoad}>
            <Text style={styles.retryText}>Försök igen</Text>
          </Pressable>
        </View>
      ) : visibleFriends.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? 'Inga vänner matchar sökningen.'
              : 'Du har inga vänner ännu.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleFriends}
          keyExtractor={(item) => item.userId}
          renderItem={renderFriendRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    paddingHorizontal: 8,
    paddingTop: 56,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  friendRowPressed: {
    backgroundColor: '#eef2f6',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  friendTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  friendMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(62, 122, 68, 0.12)',
  },
  retryText: {
    color: '#3E7A44',
    fontWeight: '600',
  },
});
