import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { BadgeThumbnail } from '../components/BadgeThumbnail';
import * as FileSystem from 'expo-file-system/legacy';
import {
  deleteMyAccount,
  Friend,
  getFriendCount,
  getFriends,
  getMyProfile,
  getMyRouteChallenges,
  Profile,
  RouteChallengeRecord,
  signOut,
  uploadAvatar,
} from '../lib/api';
import {
  challengeTargetLabel,
  savedRouteToRouteResponse,
} from '../utils/routeUtils';
import { useUserBadges } from '../hooks/useUserBadges';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// TODO: Ta bort denna dev-fallback när auth-flödet är på plats.
// Används bara så vi kan se profil-UI:t utan att vara inloggade.
const DEV_FALLBACK_PROFILE: Profile = {
  _id: 'dev',
  userId: 'dev',
  username: 'användarnamn',
  fullName: 'Förnamn Efternamn',
  age: 0,
  gender: 'other',
  avatarUrl: null,
  createdAt: '',
  updatedAt: '',
};

export function ProfileScreen({ navigation, route }: Props) {
  const from = route.params?.from;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Lokal state för vald profilbild. När vi senare lägger till uppladdning
  // mot backend ersätts denna med en URL från servern.
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [friendsCount, setFriendsCount] = useState(0);

  const [incomingChallenges, setIncomingChallenges] = useState<
    RouteChallengeRecord[]
  >([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  const challengeFromName = (challenge: RouteChallengeRecord) => {
    const fromId = String(challenge.fromUserId);
    const friend = friends.find((f) => f.userId === fromId);
    if (friend?.fullName?.trim()) return friend.fullName.trim();
    if (friend?.username) return `@${friend.username}`;
    return 'En vän';
  };

  const onAcceptChallenge = (challenge: RouteChallengeRecord) => {
    navigation.navigate('CreateRoute', {
      activeRoute: savedRouteToRouteResponse(challenge.route),
      savedRouteId: challenge.route._id,
      openAsGenerated: true,
      challengeTargetSeconds: challenge.sourceRun?.durationSeconds,
      challengeFromName: challengeFromName(challenge),
      from: from ?? 'Login',
    });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      let myId: string | undefined;
      try {
        const data = await getMyProfile();
        if (active) {
          setProfile(data);
          if (data.avatarUrl) setAvatarUri(data.avatarUrl);
        }
        myId = data.userId;
      } catch {
        if (active) setProfile(DEV_FALLBACK_PROFILE);
      } finally {
        if (active) setLoading(false);
      }

      try {
        const result = await getFriendCount();
        if (active) setFriendsCount(result.count);
      } catch {
        // behåll 0 om det misslyckas
      }

      try {
        const [allChallenges, friendList] = await Promise.all([
          getMyRouteChallenges(),
          getFriends(),
        ]);
        if (!active) return;
        setFriends(friendList);
        if (myId) {
          setIncomingChallenges(
            allChallenges
              .filter(
                (c) =>
                  c.status === 'pending' && String(c.toUserId) === String(myId)
              )
              .slice(0, 3)
          );
        }
      } catch {
        if (active) setIncomingChallenges([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onPickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Behörighet krävs',
        'Vi behöver tillgång till dina bilder för att kunna byta profilbild.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await uploadAvatar(base64);
      setAvatarUri(`data:image/jpeg;base64,${base64}`);
    }
  };

  const onSignOut = () => {
    Alert.alert('Logga ut', 'Är du säker på att du vill logga ut?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logga ut',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        },
      },
    ]);
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Radera konto',
      'Detta raderar ditt konto och all data permanent. Åtgärden kan inte ångras.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Radera',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMyAccount();
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            } catch {
              Alert.alert('Fel', 'Kunde inte radera kontot. Försök igen.');
            }
          },
        },
      ]
    );
  };

  const { badges } = useUserBadges();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.editIconButton}
          onPress={() => setMenuOpen(true)}
          accessibilityLabel="Meny"
          hitSlop={12}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#1a1a1a" />
        </Pressable>
      </View>

      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle}>Konto</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('ProfileUpsert', { from: 'Profile' });
              }}
            >
              <Ionicons name="pencil-outline" size={22} color="#1a1a1a" />
              <Text style={styles.menuItemText}>Redigera profil</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(26,26,26,0.35)" />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                onSignOut();
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#1a1a1a" />
              <Text style={styles.menuItemText}>Logga ut</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                onDeleteAccount();
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#c0392b" />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Radera konto</Text>
            </Pressable>

            <Pressable style={styles.menuCancelButton} onPress={() => setMenuOpen(false)}>
              <Text style={styles.menuCancelText}>Avbryt</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#2b2f33" />
        ) : (
          <>
            <Pressable
              style={styles.avatarWrap}
              onPress={onPickAvatar}
              accessibilityLabel="Byt profilbild"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={72} color="#b8bec5" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={18} color="#8b939c" />
              </View>
            </Pressable>

            <Text style={styles.name}>{profile?.fullName ?? ''}</Text>
            {profile?.username ? (
              <Text style={styles.username}>@{profile.username}</Text>
            ) : null}

            <Pressable
              style={styles.friendsBlock}
              accessibilityLabel="Visa vänner"
              onPress={() => navigation.navigate('Friends')}
            >
              <Text style={styles.friendsCount}>{friendsCount}</Text>
              <Text style={styles.friendsLabel}>Vänner</Text>
            </Pressable>

            <View style={styles.badgesSection}>
              <View style={styles.badgesHeader}>
                <Text style={styles.badgesTitle}>Badges</Text>
                <Pressable
                  accessibilityLabel="Visa alla badges"
                  hitSlop={8}
                  onPress={() => navigation.navigate('Badges')}
                >
                  <Ionicons name="chevron-forward" size={22} color="#1a1a1a" />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false}
                contentContainerStyle={styles.badgesList}
              >
                {badges.map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <BadgeThumbnail
                      variant="profile"
                      unlocked={badge.unlocked}
                      image={badge.image}
                    />
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeStatus} numberOfLines={1}>
                      {badge.unlocked ? '' : 'Ej upplåst'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.challengesSection}>
              <View style={styles.challengesHeader}>
                <Text style={styles.challengesTitle}>Aktuella utmaningar</Text>
                <Pressable
                  accessibilityLabel="Visa alla utmaningar"
                  hitSlop={8}
                  onPress={() => navigation.navigate('Challenges')}
                >
                  <Ionicons name="chevron-forward" size={22} color="#1a1a1a" />
                </Pressable>
              </View>

              {incomingChallenges.length === 0 ? (
                <Text style={styles.challengesEmpty}>
                  Här var det tomt! Inga utmaningar för tillfället.
                </Text>
              ) : (
                <View style={styles.challengesList}>
                  {incomingChallenges.map((challenge) => {
                    const name = challengeFromName(challenge);
                    const target = challenge.sourceRun?.durationSeconds;
                    return (
                      <View key={challenge._id} style={styles.challengeRow}>
                        <View style={styles.challengeAvatar}>
                          <Ionicons name="person" size={26} color="#b8bec5" />
                        </View>

                        <View style={styles.challengeText}>
                          <Text style={styles.challengeName} numberOfLines={1}>
                            {name} utmanar dig!
                          </Text>
                          <Text style={styles.challengeTime} numberOfLines={1}>
                            {challengeTargetLabel(target)}
                          </Text>
                        </View>

                        <Pressable
                          style={styles.challengeAccept}
                          onPress={() => onAcceptChallenge(challenge)}
                          accessibilityLabel={`Acceptera utmaning från ${name}`}
                        >
                          <Text style={styles.challengeAcceptText}>
                            Acceptera
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <Pressable
              style={styles.historyLink}
              onPress={() => navigation.navigate('History')}
              accessibilityLabel="Se historik"
            >
              <Text style={styles.historyLinkText}>Se Historik</Text>
              <Ionicons name="chevron-forward" size={20} color="#1a1a1a" />
            </Pressable>

          </>
        )}
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
  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  editIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  avatarWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
    overflow: 'visible',
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },
  username: {
    fontSize: 15,
    color: '#7c8189',
    marginTop: 7,
  },
  friendsBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  friendsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  friendsLabel: {
    fontSize: 15,
    color: '#1a1a1a',
    marginTop: 2,
  },
  badgesSection: {
    alignSelf: 'stretch',
    marginTop: 22,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  badgesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badgesList: {
    paddingHorizontal: 4,
    paddingRight: 24,
    paddingTop: 2,
    gap: 18,
  },
  badgeItem: {
    width: 108,
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  badgeStatus: {
    fontSize: 12,
    color: '#9aa1a8',
    marginTop: 2,
    textAlign: 'center',
  },
  challengesSection: {
    alignSelf: 'stretch',
    marginTop: 28,
  },
  challengesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  challengesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  challengesEmpty: {
    fontSize: 14,
    color: '#7c8189',
    paddingHorizontal: 4,
  },
  challengesList: {
    gap: 12,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  challengeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  challengeAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  challengeText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  challengeTime: {
    fontSize: 13,
    color: '#7c8189',
    marginTop: 2,
  },
  challengeAccept: {
    backgroundColor: '#2f7048',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  challengeAcceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  historyLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  menuHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(26,26,26,0.15)',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(26,26,26,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 4,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  menuItemDanger: {
    color: '#c0392b',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26,26,26,0.1)',
    marginVertical: 4,
  },
  menuCancelButton: {
    marginTop: 12,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#f1f2f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
