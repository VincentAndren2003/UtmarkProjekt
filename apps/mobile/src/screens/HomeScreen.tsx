import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/video/33212-395657672.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>+</Text>
          </View>
          <Text style={styles.primaryLabel}>Go to Create Account</Text>
          <Text style={styles.chevron}>&gt;</Text>
        </Pressable>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>o</Text>
          </View>
          <Text style={styles.secondaryLabel}>Already have an account? Go to Login</Text>
          <Text style={styles.chevron}>&gt;</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 44,
    gap: 14,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 29,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(66, 110, 52, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 29,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
  },
  primaryLabel: {
    flex: 1,
    color: '#f8f8f5',
    fontSize: 23,
    fontWeight: '600',
  },
  secondaryLabel: {
    flex: 1,
    color: '#f3f3f3',
    fontSize: 17,
    fontWeight: '500',
  },
  chevron: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
});
