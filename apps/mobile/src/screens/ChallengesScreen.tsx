import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import {
  declineRouteChallenge,
  Friend,
  getFriends,
  getMyProfile,
  getMyRouteChallenges,
  RouteChallengeRecord,
} from '../lib/api';
import {
  challengeTargetLabel,
  savedRouteToRouteResponse,
} from '../utils/routeUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Challenges'>;

function idString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '_id' in (value as object)) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function challengerFriend(
  challenge: RouteChallengeRecord,
  friends: Friend[]
): Friend | undefined {
  return friends.find((f) => f.userId === idString(challenge.fromUserId));
}

function challengerName(
  challenge: RouteChallengeRecord,
  friends: Friend[]
): string {
  const friend = challengerFriend(challenge, friends);
  if (friend?.fullName?.trim()) return friend.fullName.trim();
  if (friend?.username) return `@${friend.username}`;
  return 'En vän';
}

export function ChallengesScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<RouteChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [me, friendList, all] = await Promise.all([
        getMyProfile(),
        getFriends(),
        getMyRouteChallenges(),
      ]);
      setFriends(friendList);
      const myId = me.userId;
      const incoming = all.filter(
        (c) => c.status === 'pending' && idString(c.toUserId) === idString(myId)
      );
      setChallenges(incoming);
    } catch {
      setChallenges([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const onDecline = async (challenge: RouteChallengeRecord) => {
    try {
      await declineRouteChallenge(challenge._id);
      setChallenges((prev) => prev.filter((c) => c._id !== challenge._id));
    } catch {
      // tyst fel – utmaningen finns kvar i listan
    }
  };

  const onAccept = (challenge: RouteChallengeRecord) => {
    const route = challenge.route;
    if (!route?._id) return;
    const targetSeconds = challenge.sourceRun?.durationSeconds;
    navigation.navigate('CreateRoute', {
      activeRoute: savedRouteToRouteResponse(route),
      savedRouteId: route._id,
      openAsGenerated: true,
      challengeTargetSeconds: targetSeconds,
      challengeFromName: challengerName(challenge, friends),
      from: 'Login',
    });
  };

  const renderItem = ({ item }: { item: RouteChallengeRecord }) => {
    const target = item.sourceRun?.durationSeconds;
    const friend = challengerFriend(item, friends);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardAvatar}>
            {friend?.avatarUrl ? (
              <Image
                source={{ uri: friend.avatarUrl }}
                style={styles.cardAvatarImage}
              />
            ) : (
              <Ionicons name="person" size={24} color="#b8bec5" />
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {challengerName(item, friends)} utmanar dig!
          </Text>
        </View>
        <Text style={styles.cardMeta}>
          {item.route.distance} km · {item.route.checkpoints.length} checkpoints
        </Text>
        <Text style={styles.cardTarget}>{challengeTargetLabel(target)}</Text>
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.declineButton}
            onPress={() => onDecline(item)}
          >
            <Text style={styles.declineButtonText}>Neka</Text>
          </Pressable>
          <Pressable
            style={styles.acceptButton}
            onPress={() => onAccept(item)}
          >
            <Text style={styles.acceptButtonText}>Visa rutt</Text>
          </Pressable>
        </View>
      </View>
    );
  };

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
        <Text style={styles.title}>Utmaningar</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3E7A44" />
        </View>
      ) : challenges.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Inga väntande utmaningar just nu.
          </Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    paddingBottom: 16,
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardTarget: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3E7A44',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  declineButton: {
    backgroundColor: '#f1f2f4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  declineButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#3E7A44',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
