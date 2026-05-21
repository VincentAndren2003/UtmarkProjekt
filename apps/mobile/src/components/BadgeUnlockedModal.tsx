import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Badge } from '../data/badges';

type Props = {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
  onViewAll: () => void;
};

export function BadgeUnlockedModal({
  badge,
  visible,
  onClose,
  onViewAll,
}: Props) {
  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Stäng"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#6b7280" />
          </Pressable>

          <Text style={styles.title}>Badge upplåst!</Text>

          <View style={styles.badgeFrame}>
            {badge.image ? (
              <Image
                source={badge.image}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="ribbon" size={56} color="#2f7a3f" />
            )}
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>

          <View style={styles.divider} />

          <Pressable style={styles.ctaButton} onPress={onViewAll}>
            <Text style={styles.ctaText}>Visa alla badges</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 20,
  },
  badgeFrame: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeImage: {
    width: 130,
    height: 130,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 15,
    color: '#8a949c',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: '#e8ecef',
    marginBottom: 16,
  },
  ctaButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2f7a3f',
    paddingVertical: 16,
    borderRadius: 28,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
