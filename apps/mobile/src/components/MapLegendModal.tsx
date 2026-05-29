import kartteckenImage from '../../assets/karttecken.png';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
// Keep A4 aspect ratio (842 × 1191)
const IMAGE_DISPLAY_WIDTH = SCREEN_WIDTH - 16;
const IMAGE_DISPLAY_HEIGHT = IMAGE_DISPLAY_WIDTH * (1191 / 842);

const COLOR = '#BA55A0';

export function MapLegendModal({ visible, onClose }: Props) {
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
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Karttecken</Text>
              <Text style={styles.subtitle}>Nyp för att zooma in</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.symbolSection}>
            {/* Startpunkt – triangel */}
            <View style={styles.symbolRow}>
              <View style={styles.triangleWrap}>
                <View style={styles.triangle} />
              </View>
              <Text style={styles.symbolLabel}>Startpunkt</Text>
            </View>
            {/* Mål – dubbel cirkel */}
            <View style={styles.symbolRow}>
              <View style={styles.doubleCircleWrap}>
                <View style={styles.outerCircle}>
                  <View style={styles.innerCircle} />
                </View>
              </View>
              <Text style={styles.symbolLabel}>Mål</Text>
            </View>
          </View>

          <ScrollView
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bouncesZoom
            centerContent
          >
            <Image
              source={kartteckenImage}
              style={{
                width: IMAGE_DISPLAY_WIDTH,
                height: IMAGE_DISPLAY_HEIGHT,
              }}
              resizeMode="contain"
            />
          </ScrollView>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 16,
    height: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(26,26,26,0.15)',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(26,26,26,0.45)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: 'rgba(26,26,26,0.5)',
  },
  symbolSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f5f6f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  symbolLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  triangleWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLOR,
  },
  doubleCircleWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLOR,
  },
  imageScroll: {
    flex: 1,
  },
  imageScrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
});
