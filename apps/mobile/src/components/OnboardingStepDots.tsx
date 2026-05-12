import { StyleSheet, View } from 'react-native';

type Props = {
  /** 1 = konto (email/lösenord), 2 = profil */
  currentStep: 1 | 2;
};

export function OnboardingStepDots({ currentStep }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, currentStep >= 1 && styles.dotFilled]} />
      <View style={[styles.dot, currentStep >= 2 && styles.dotFilled]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 28,
    width: '100%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(223, 230, 233, 1)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#3E7A44',
    borderColor: '#3E7A44',
  },
});
