import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import { RootStackParamList } from '../../App';
import backgroundVideo from '../../assets/video/33212-395657672.mp4';
import logoIcon from '../../assets/icon.png';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Video
        source={backgroundVideo}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      <View style={styles.overlay} />

      <View style={styles.main}>
        <View style={styles.logoBlock}>
          <View style={styles.logo}>
            <Image source={logoIcon} style={styles.logo} />
          </View>
          <Text style={styles.logoHeaderText}>UTMARK</Text>
          <Text style={styles.logoSubText}>
            Hitta ditt nästa äventyr i skogen
          </Text>
        </View>

        <View style={styles.buttonBlock}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateAccount')}
          >
            <Text style={styles.primaryLabel}>Kom igång</Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ELLER</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryLabel}>Logga in</Text>
          </Pressable>
        </View>
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

  main: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 150,
    paddingBottom: 200,
    paddingHorizontal: 24,
  },

  logoBlock: {
    alignItems: 'center',
    gap: 12,
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    opacity: 1,
  },

  logoHeaderText: {
    color: 'rgba(232, 244, 237, 1)',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    fontStyle: 'normal',
    letterSpacing: 2,
  },

  logoSubText: {
    color: 'rgba(232, 244, 237, 1)',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'normal',
  },

  buttonBlock: {
    width: 280,
    gap: 14,
  },

  primaryButton: {
    width: 280,
    height: 50,
    opacity: 1,
    borderRadius: 15,
    backgroundColor: 'rgba(232, 244, 237, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    width: 280,
    height: 50,
    opacity: 1,
    borderRadius: 15,
    backgroundColor: 'rgba(45, 94, 64, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.85,
  },

  primaryLabel: {
    color: '#2D5E40',
    fontSize: 23,
    fontWeight: '600',
    textAlign: 'center',
  },

  secondaryLabel: {
    color: '#E8F4ED',
    fontSize: 23,
    fontWeight: '500',
    textAlign: 'center',
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
    color: 'rgba(232, 244, 237, 1)',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
});

// färgkoder:
// gröna färgen från figma: background: rgba(45, 94, 64, 1);
// UTMARK färgen: rgba(232, 244, 237, 1) #E8F4ED
//
