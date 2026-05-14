import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

export type BadgeThumbnailVariant = 'list' | 'profile';

type Props = {
  unlocked: boolean;
  image?: ImageSourcePropType;
  variant: BadgeThumbnailVariant;
};

const LIST_FRAME = 80;
const LIST_PLACEHOLDER = 64;
const PROFILE_FRAME = 80;
const PROFILE_PLACEHOLDER = 64;

export function BadgeThumbnail({ unlocked, image, variant }: Props) {
  const isList = variant === 'list';

  if (!image) {
    const size = isList ? LIST_PLACEHOLDER : PROFILE_PLACEHOLDER;
    return (
      <View
        style={[
          styles.placeholder,
          isList ? styles.placeholderList : styles.placeholderProfile,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Ionicons name="lock-closed" size={isList ? 28 : 28} color="#9aa1a8" />
      </View>
    );
  }

  if (unlocked) {
    return (
      <Image
        source={image}
        style={isList ? styles.imageListUnlocked : styles.imageProfileUnlocked}
        resizeMode="contain"
      />
    );
  }

  const frame = isList ? LIST_FRAME : PROFILE_FRAME;
  return (
    <View
      style={[
        styles.lockedWrap,
        isList ? styles.lockedWrapList : styles.lockedWrapProfile,
        { width: frame, height: frame },
      ]}
    >
      <View
        style={[styles.lockedImageStack, { width: frame, height: frame }]}
      >
        <Image
          source={image}
          style={[
            styles.lockedBadgeImage,
            {
              width: frame,
              height: frame,
              transform: [{ translateY: 6 }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.lockedVeil} pointerEvents="none" />
      <View style={styles.lockIconWrap} pointerEvents="none">
        <Ionicons
          name="lock-closed"
          size={isList ? 28 : 26}
          color="rgba(255,255,255,0.92)"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#ececee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderList: {
    marginRight: 14,
  },
  placeholderProfile: {
    marginBottom: 8,
  },
  imageListUnlocked: {
    width: LIST_FRAME,
    height: LIST_FRAME,
    marginRight: 10,
    marginTop: -3,
    marginBottom: -13,
    marginLeft: -8,
  },
  imageProfileUnlocked: {
    width: PROFILE_FRAME,
    height: PROFILE_FRAME,
    marginBottom: 8,
  },
  lockedWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockedWrapList: {
    marginRight: 10,
    marginTop: -3,
    marginBottom: -13,
    marginLeft: -8,
  },
  lockedWrapProfile: {
    marginBottom: 8,
  },
  lockedImageStack: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cfd4d9',
  },
  lockedBadgeImage: {
    opacity: 0.42,
  },
  lockedVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36, 40, 44, 0.38)',
  },
  lockIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
