import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
import type { Badge } from '../data/badges';
import { getConfettiColorsForBadge } from '../data/badgeConfettiColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  badges: Badge[];
  visible: boolean;
  onClose: () => void;
  onViewAll: () => void;
};

export function BadgeUnlockedModal({
  badges,
  visible,
  onClose,
  onViewAll,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setPageIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [visible, badges]);

  if (!visible || badges.length === 0) return null;

  const multiple = badges.length > 1;
  const title = multiple ? 'Badges upplåsta!' : 'Badge upplåst!';

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setPageIndex(Math.min(Math.max(index, 0), badges.length - 1));
  };

  const activeBadge = badges[pageIndex] ?? badges[0];
  const confettiColors = getConfettiColorsForBadge(activeBadge.id);
  const accentColor = confettiColors[0] ?? '#2f7a3f';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.confettiLayer} pointerEvents="none">
          <ConfettiCannon
            key={`${activeBadge.id}-${pageIndex}`}
            count={180}
            origin={{ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.22 }}
            fadeOut
            autoStart
            colors={confettiColors}
            explosionSpeed={420}
            fallSpeed={2800}
          />
        </View>

        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Stäng"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#6b7280" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <View
            style={styles.pagerSlot}
            onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          >
            {pageWidth > 0 ? (
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                style={{ width: pageWidth }}
              >
                {badges.map((badge) => (
                  <View
                    key={badge.id}
                    style={[styles.page, { width: pageWidth }]}
                  >
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
                    <Text style={styles.badgeDescription}>
                      {badge.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>

          {multiple ? (
            <View style={styles.dotsRow}>
              {badges.map((badge, index) => (
                <View
                  key={badge.id}
                  style={[
                    styles.dot,
                    index === pageIndex && [
                      styles.dotActive,
                      { backgroundColor: accentColor },
                    ],
                  ]}
                />
              ))}
            </View>
          ) : null}

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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    zIndex: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
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
    zIndex: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 12,
  },
  pagerSlot: {
    alignSelf: 'stretch',
    minHeight: 220,
  },
  page: {
    alignItems: 'center',
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
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: '#e8ecef',
    marginTop: 16,
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
