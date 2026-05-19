import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  acceptFriendRequest,
  Friend,
  getPendingFriendRequests,
  removeFriend,
} from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendRequests'>;

type TabKey = 'received' | 'sent';

// Visningsnamn: fullName om det finns, annars @username.
function displayName(profile: Friend): string {
  if (profile.fullName?.trim()) return profile.fullName.trim();
  return profile.username ? `@${profile.username}` : 'Användare';
}

export function FriendRequestsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('received');
  const [received, setReceived] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  // Hämtar inkommande förfrågningar från backend.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getPendingFriendRequests();
        if (!active) return;
        setReceived(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setReceived([]);
        setError(
          err instanceof Error ? err.message : 'Kunde inte hämta förfrågningar'
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

  const onAccept = async (profile: Friend) => {
    setActingOnId(profile.userId);
    try {
      await acceptFriendRequest(profile.userId);
      setReceived((prev) => prev.filter((p) => p.userId !== profile.userId));
    } catch (err) {
      Alert.alert(
        'Kunde inte acceptera',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setActingOnId(null);
    }
  };

  const onDecline = async (profile: Friend) => {
    setActingOnId(profile.userId);
    try {
      await removeFriend(profile.userId);
      setReceived((prev) => prev.filter((p) => p.userId !== profile.userId));
    } catch (err) {
      Alert.alert(
        'Kunde inte neka',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setActingOnId(null);
    }
  };

  const renderReceivedCard = ({ item }: { item: Friend }) => {
    const busy = actingOnId === item.userId;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#b8bec5" />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {displayName(item)}
            </Text>
            {item.username ? (
              <Text style={styles.cardMeta} numberOfLines={1}>
                @{item.username}
              </Text>
            ) : null}
            {/* TODO: Nivå och avstånd när backend/profil har dessa fält. */}
          </View>

          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => onDecline(item)}
              disabled={busy}
              accessibilityLabel={`Neka förfrågan från ${displayName(item)}`}
            >
              <Ionicons name="close" size={22} color="#6b7280" />
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAccept(item)}
              disabled={busy}
              accessibilityLabel={`Acceptera förfrågan från ${displayName(item)}`}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* TODO: Visa meddelande när vänförfrågningar kan ha text i backend. */}
      </View>
    );
  };

  // TODO: Lista utgående förfrågningar när GET /api/friends/sent finns.
  const emptyState = (message: string) => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

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
        <Text style={styles.title}>Vänförfrågningar</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}
          >
            Mottagna
          </Text>
          {received.length > 0 && (
            <View
              style={[
                styles.tabBadge,
                activeTab === 'received' && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'received' && styles.tabBadgeTextActive,
                ]}
              >
                {received.length}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.tabTextActive,
            ]}
          >
            Skickade
          </Text>
        </Pressable>
      </View>

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
      ) : activeTab === 'sent' ? (
        emptyState('Inga skickade förfrågningar att visa.')
      ) : received.length === 0 ? (
        emptyState('Du har inga nya vänförfrågningar.')
      ) : (
        <FlatList
          data={received}
          keyExtractor={(item) => item.userId}
          renderItem={renderReceivedCard}
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
    backgroundColor: '#f5f6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
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
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#eef2f6',
  },
  tabActive: {
    backgroundColor: '#3E7A44',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E7A44',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: '#eef2f6',
  },
  acceptButton: {
    backgroundColor: '#3E7A44',
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
