import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createRouteChallenge, Friend, getFriends } from '../lib/api';
import { challengeTargetLabel, formatDurationClock } from '../utils/routeUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
  routeId: string;
  sourceRunId?: string;
  targetSeconds?: number;
};

function friendDisplayName(friend: Friend): string {
  if (friend.fullName?.trim()) return friend.fullName.trim();
  return friend.username ? `@${friend.username}` : 'Vän';
}

export function ChallengeFriendModal({
  visible,
  onClose,
  routeId,
  sourceRunId,
  targetSeconds,
}: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [challengingId, setChallengingId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const data = await getFriends();
        if (!active) return;
        setFriends(data);
      } catch {
        if (!active) return;
        setFriends([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [visible]);

  const onPickFriend = async (friend: Friend) => {
    setChallengingId(friend.userId);
    try {
      await createRouteChallenge({
        friendId: friend.userId,
        routeId,
        sourceRunId,
      });
      const name = friendDisplayName(friend);
      const timePart =
        targetSeconds != null && targetSeconds > 0
          ? ` Måltid att slå: ${formatDurationClock(targetSeconds)}.`
          : ' Samma planerade rutt som du — ingen måltid registrerad.';
      Alert.alert(
        'Utmaning skickad',
        `${name} kan nu köra utmaningen.${timePart}`
      );
      onClose();
    } catch (err) {
      Alert.alert(
        'Kunde inte skicka utmaning',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setChallengingId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Välj vän att utmana</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={26} color="#1a1a1a" />
            </Pressable>
          </View>
          <Text style={styles.hint}>{challengeTargetLabel(targetSeconds)}</Text>
          {loading ? (
            <ActivityIndicator color="#3E7A44" style={styles.spinner} />
          ) : friends.length === 0 ? (
            <Text style={styles.empty}>
              Du har inga vänner ännu. Lägg till vänner under Profil.
            </Text>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.userId}
              style={styles.list}
              renderItem={({ item }) => {
                const busy = challengingId === item.userId;
                return (
                  <Pressable
                    style={styles.row}
                    disabled={busy}
                    onPress={() => onPickFriend(item)}
                  >
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={24} color="#b8bec5" />
                    </View>
                    <Text style={styles.name}>{friendDisplayName(item)}</Text>
                    {busy ? (
                      <ActivityIndicator color="#3E7A44" />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  hint: {
    fontSize: 14,
    color: '#3E7A44',
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 24,
    fontSize: 15,
  },
  spinner: {
    marginTop: 24,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
