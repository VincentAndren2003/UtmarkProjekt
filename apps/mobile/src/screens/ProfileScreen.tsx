import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { getBadgesForUser } from '../data/badges';
import { getMyProfile, Profile } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Utmaning skickad av en annan användare. Sätt avatarUri när vi har bilder.
type Challenge = {
  id: string;
  fromName: string;
  timeLabel: string;
  avatarUri?: string;
};

// TODO: Ta bort denna dev-fallback när auth-flödet är på plats.
// Används bara så vi kan se profil-UI:t utan att vara inloggade.
const DEV_FALLBACK_PROFILE: Profile = {
  _id: 'dev',
  userId: 'dev',
  username: 'användarnamn',
  fullName: 'Förnamn Efternamn',
  age: 0,
  gender: 'other',
  createdAt: '',
  updatedAt: '',
};

export function ProfileScreen({ navigation, route }: Props) {
  const from = route.params?.from;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Lokal state för vald profilbild. När vi senare lägger till uppladdning
  // mot backend ersätts denna med en URL från servern.
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Placeholder tills vi har en vänner-funktion i backend.
  const friendsCount = 0;

  // TODO: Hämta från backend när utmaningar finns. Sätt till [] för att
  // se tomma tillståndet i UI:t.
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const onAcceptChallenge = (id: string) => {
    // TODO: anropa backend för att acceptera utmaningen.
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMyProfile();
        if (active) setProfile(data);
      } catch {
        // TODO: Ta bort fallback när vi har en riktig "ej inloggad"-hantering.
        if (active) setProfile(DEV_FALLBACK_PROFILE);
      } finally {
        if (active) setLoading(false);
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
      setAvatarUri(result.assets[0].uri);
    }
  };

  const badges = getBadgesForUser();

  return (
    <View style={styles.container}>
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
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </Pressable>

            <Text style={styles.name}>{profile?.fullName ?? ''}</Text>
            {profile?.username ? (
              <Text style={styles.username}>@{profile.username}</Text>
            ) : null}

            <View style={styles.friendsBlock}>
              <Text style={styles.friendsCount}>{friendsCount}</Text>
              <Text style={styles.friendsLabel}>Vänner</Text>
            </View>

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

              {challenges.length === 0 ? (
                <Text style={styles.challengesEmpty}>
                  Här var det tomt! Inga utmaningar för tillfället.
                </Text>
              ) : (
                <View style={styles.challengesList}>
                  {challenges.map((challenge) => (
                    <View key={challenge.id} style={styles.challengeRow}>
                      <View style={styles.challengeAvatar}>
                        {challenge.avatarUri ? (
                          <Image
                            source={{ uri: challenge.avatarUri }}
                            style={styles.challengeAvatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={26} color="#b8bec5" />
                        )}
                      </View>

                      <View style={styles.challengeText}>
                        <Text style={styles.challengeName} numberOfLines={1}>
                          {challenge.fromName} utmanar dig!
                        </Text>
                        <Text style={styles.challengeTime} numberOfLines={1}>
                          {challenge.timeLabel}
                        </Text>
                      </View>

                      <Pressable
                        style={styles.challengeAccept}
                        onPress={() => onAcceptChallenge(challenge.id)}
                        accessibilityLabel={`Acceptera utmaning från ${challenge.fromName}`}
                      >
                        <Text style={styles.challengeAcceptText}>
                          Acceptera
                        </Text>
                      </Pressable>
                    </View>
                  ))}
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 66,
  },
  avatarWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
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
    right: 6,
    bottom: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2b2f33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
});
