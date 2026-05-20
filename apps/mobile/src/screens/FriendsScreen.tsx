import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  Friend,
  getFriends,
  Profile,
  removeFriend,
  searchUsers,
  sendFriendRequest,
} from '../lib/api';

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

function profileDisplayName(profile: Profile): string {
  if (profile.fullName?.trim()) return profile.fullName.trim();
  return profile.username ? `@${profile.username}` : 'Användare';
}

export function FriendsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [addSearchResults, setAddSearchResults] = useState<Profile[]>([]);
  const [addSearchLoading, setAddSearchLoading] = useState(false);
  const [addSearchNotice, setAddSearchNotice] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(
    () => new Set()
  );
  const [addingId, setAddingId] = useState<string | null>(null);
  // Ökas vid "Försök igen" så useEffect hämtar vänlistan på nytt.
  const [reloadNonce, setReloadNonce] = useState(0);

  const friendIds = useMemo(
    () => new Set(friends.map((f) => f.userId)),
    [friends]
  );

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

  const trimmedAddSearch = addSearchQuery.trim();
  const addSearchTooShort = trimmedAddSearch.length < 2;

  // Sök nya personer i popup (debounce). setState bara i timeout/async.
  useEffect(() => {
    if (!addModalVisible || addSearchTooShort) return;

    let active = true;

    const timer = setTimeout(async () => {
      if (!active) return;
      setAddSearchLoading(true);
      setAddSearchNotice(null);
      try {
        const results = await searchUsers(trimmedAddSearch);
        if (!active) return;
        setAddSearchResults(results.filter((p) => !friendIds.has(p.userId)));
        setAddSearchNotice(null);
      } catch (err) {
        if (!active) return;
        setAddSearchResults([]);
        const message = err instanceof Error ? err.message : 'Kunde inte söka.';
        setAddSearchNotice(
          message === 'HTTP 401'
            ? 'Du måste vara inloggad för att söka.'
            : message
        );
      } finally {
        if (active) setAddSearchLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [addModalVisible, addSearchTooShort, trimmedAddSearch, friendIds]);

  const openAddModal = () => {
    setAddSearchQuery('');
    setAddSearchResults([]);
    setAddSearchNotice(null);
    setAddModalVisible(true);
  };

  const closeAddModal = () => {
    setAddModalVisible(false);
    setAddSearchQuery('');
    setAddSearchResults([]);
    setAddSearchNotice(null);
  };

  const onSendFriendRequest = async (profile: Profile) => {
    setAddingId(profile.userId);
    try {
      await sendFriendRequest(profile.userId);
      setSentRequestIds((prev) => new Set(prev).add(profile.userId));
    } catch (err) {
      Alert.alert(
        'Kunde inte skicka',
        err instanceof Error ? err.message : 'Försök igen senare.'
      );
    } finally {
      setAddingId(null);
    }
  };

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

        <View style={styles.topBarActions}>
          <Pressable
            style={styles.headerShortcut}
            onPress={openAddModal}
            accessibilityLabel="Lägg till vän"
            hitSlop={8}
          >
            <View style={styles.headerIconBox}>
              <Ionicons name="add-circle-outline" size={26} color="#1a1a1a" />
            </View>
            <Text style={styles.headerShortcutLabel}>Lägg till</Text>
          </Pressable>

          <Pressable
            style={styles.headerShortcut}
            onPress={() => navigation.navigate('FriendRequests')}
            accessibilityLabel="Förfrågningar"
            hitSlop={8}
          >
            <View style={styles.headerIconBox}>
              <Ionicons name="person-add-outline" size={26} color="#1a1a1a" />
            </View>
            <Text style={styles.headerShortcutLabel}>Förfrågningar</Text>
          </Pressable>
        </View>
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
      ) : friends.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Du har inga vänner ännu.</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.userId}
          renderItem={renderFriendRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeAddModal}
            accessibilityLabel="Stäng"
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[
              styles.modalKeyboardAvoid,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
            keyboardVerticalOffset={0}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lägg till vän</Text>
                <Pressable
                  onPress={closeAddModal}
                  hitSlop={8}
                  accessibilityLabel="Stäng"
                >
                  <Ionicons name="close" size={26} color="#1a1a1a" />
                </Pressable>
              </View>

              <View style={styles.modalSearchWrap}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Sök efter personer i Utmark"
                  placeholderTextColor="#9ca3af"
                  value={addSearchQuery}
                  onChangeText={setAddSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <View style={styles.modalBody}>
                {addSearchTooShort ? (
                  <Text style={styles.modalHint}>
                    Skriv minst 2 tecken för att söka.
                  </Text>
                ) : addSearchLoading ? (
                  <ActivityIndicator color="#3E7A44" />
                ) : addSearchNotice ? (
                  <Text style={styles.modalHint}>{addSearchNotice}</Text>
                ) : addSearchResults.length === 0 ? (
                  <Text style={styles.modalHint}>Inga personer hittades.</Text>
                ) : (
                  <FlatList
                    data={addSearchResults}
                    keyExtractor={(item) => item.userId}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={styles.modalList}
                    contentContainerStyle={styles.modalListContent}
                    renderItem={({ item }) => {
                      const sent = sentRequestIds.has(item.userId);
                      const busy = addingId === item.userId;

                      return (
                        <View style={styles.modalResultRow}>
                          <View style={styles.avatar}>
                            <Ionicons name="person" size={28} color="#b8bec5" />
                          </View>
                          <View style={styles.friendTextBlock}>
                            <Text style={styles.friendName} numberOfLines={1}>
                              {profileDisplayName(item)}
                            </Text>
                            {item.username ? (
                              <Text style={styles.friendMeta} numberOfLines={1}>
                                @{item.username}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable
                            style={[
                              styles.addFriendButton,
                              sent && styles.addFriendButtonSent,
                            ]}
                            disabled={sent || busy}
                            onPress={() => onSendFriendRequest(item)}
                          >
                            <Text
                              style={[
                                styles.addFriendButtonText,
                                sent && styles.addFriendButtonTextSent,
                              ]}
                            >
                              {sent ? 'Skickad' : 'Lägg till'}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  headerShortcut: {
    alignItems: 'center',
    width: 84,
    paddingTop: 2,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerShortcutLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
    minHeight: 28,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalKeyboardAvoid: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalSheet: {
    width: '100%',
    flexGrow: 1,
  },
  modalBody: {
    flexGrow: 1,
    minHeight: 140,
    maxHeight: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  modalHint: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  modalResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  addFriendButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3E7A44',
  },
  addFriendButtonSent: {
    backgroundColor: '#eef2f6',
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addFriendButtonTextSent: {
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 8,
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
