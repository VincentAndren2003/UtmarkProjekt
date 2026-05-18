import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PanResponderInstance } from 'react-native';

type Props = {
  /** First word of profile `fullName`; generic line if null. */
  greetingFirstName: string | null;
  distanceKm: number;
  isGenerating: boolean;
  sliderX: Animated.Value;
  sliderPanHandlers: PanResponderInstance['panHandlers'];
  onSliderLayout: (width: number) => void;
  onGenerate: () => void;
};

export function RouteRequestSheet({
  greetingFirstName,
  distanceKm,
  isGenerating,
  sliderX,
  sliderPanHandlers,
  onSliderLayout,
  onGenerate,
}: Props) {
  return (
    <>
      <Text style={styles.greeting}>
        {greetingFirstName
          ? `Redo för ett nytt äventyr, ${greetingFirstName}?`
          : 'Redo för ett nytt äventyr?'}
      </Text>
      <View style={styles.sectionDivider} />
      <Text style={styles.lengthTitle}>Välj längden på din rutt</Text>

      <View
        {...sliderPanHandlers}
        onLayout={(evt) => {
          onSliderLayout(evt.nativeEvent.layout.width);
        }}
        style={styles.sliderRow}
      >
        <View style={styles.sliderLine} />
        <Animated.View
          style={[styles.sliderThumb, { transform: [{ translateX: sliderX }] }]}
        />
      </View>
      <Text style={styles.sliderValue}>{distanceKm} km</Text>

      <Pressable
        style={[
          styles.generateButton,
          isGenerating && styles.generateButtonDisabled,
        ]}
        onPress={onGenerate}
        disabled={isGenerating}
      >
        <Text style={styles.generateButtonText}>
          {isGenerating ? 'Genererar rutt...' : '▶ Generera ny rutt'}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e1e5ea',
    marginHorizontal: 8,
    marginBottom: 18,
  },
  lengthTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderRow: {
    marginHorizontal: 12,
    height: 26,
    justifyContent: 'center',
    marginBottom: 4,
  },
  sliderLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#111',
    opacity: 0.9,
  },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111',
  },
  sliderValue: {
    fontSize: 17,
    color: '#111',
    fontWeight: '600',
    marginLeft: 28,
    marginBottom: 20,
  },
  generateButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2f7a3f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
