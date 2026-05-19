import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PanResponderInstance } from 'react-native';

export type PlacementMode = 'start' | 'end' | null;

type Props = {
  greetingFirstName: string | null;
  distanceKm: number;
  isGenerating: boolean;
  sliderX: Animated.Value;
  sliderPanHandlers: PanResponderInstance['panHandlers'];
  onSliderLayout: (width: number) => void;
  onGenerate: () => void;
  placementMode: PlacementMode;
  startPlaced: boolean;
  endPlaced: boolean;
  onSelectStart: () => void;
  onSelectEnd: () => void;
  onConfirmPlacement: () => void;
  onCancelPlacement: () => void;
  placementPinReady: boolean;
};

export function RouteRequestSheet({
  greetingFirstName,
  distanceKm,
  isGenerating,
  sliderX,
  sliderPanHandlers,
  onSliderLayout,
  onGenerate,
  placementMode,
  startPlaced,
  endPlaced,
  onSelectStart,
  onSelectEnd,
  onConfirmPlacement,
  onCancelPlacement,
  placementPinReady,
}: Props) {
  const isPlacing = placementMode !== null;

  if (isPlacing) {
    return (
      <View style={styles.placementSheet}>
        <Text style={styles.placementTitle}>
          {placementMode === 'start'
            ? 'Placera startposition'
            : 'Placera slutposition'}
        </Text>
        <Text style={styles.placementHint}>
          {placementPinReady
            ? 'Tryck någon annanstans på kartan för att flytta pin, sedan bekräfta.'
            : 'Tryck på kartan där du vill ha pin, sedan bekräfta.'}
        </Text>
        <View style={styles.placementActions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelPlacement,
              pressed && styles.placementButtonPressed,
            ]}
            onPress={onCancelPlacement}
          >
            <Text style={styles.cancelPlacementText}>Avbryt</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.confirmPlacement,
              !placementPinReady && styles.confirmPlacementDisabled,
              pressed && placementPinReady && styles.placementButtonPressed,
            ]}
            onPress={onConfirmPlacement}
            disabled={!placementPinReady}
          >
            <Text
              style={[
                styles.confirmPlacementText,
                !placementPinReady && styles.confirmPlacementTextDisabled,
              ]}
            >
              Bekräfta placering
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.greeting}>
        {greetingFirstName
          ? `Redo för ett nytt äventyr, ${greetingFirstName}?`
          : 'Redo för ett nytt äventyr?'}
      </Text>
      <View style={styles.sectionDivider} />

      <Text style={styles.lengthTitle}>Välj ruttlängden</Text>

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

      <Text style={styles.positionSectionTitle}>
        Valfri start och slutposition
      </Text>

      <Pressable
        style={[
          styles.positionRow,
          placementMode === 'start' && styles.positionRowActive,
        ]}
        onPress={onSelectStart}
        disabled={isGenerating}
      >
        <Text style={styles.positionRowTitle}>Välj startposition</Text>
        <Text
          style={[
            styles.positionRowStatus,
            startPlaced && styles.positionRowStatusPlaced,
          ]}
        >
          {startPlaced ? 'Placerad' : 'Ej placerad'}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.positionRow,
          placementMode === 'end' && styles.positionRowActive,
        ]}
        onPress={onSelectEnd}
        disabled={isGenerating}
      >
        <Text style={styles.positionRowTitle}>Välj slutposition</Text>
        <Text
          style={[
            styles.positionRowStatus,
            endPlaced && styles.positionRowStatusPlaced,
          ]}
        >
          {endPlaced ? 'Placerad' : 'Ej placerad'}
        </Text>
      </Pressable>

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
    marginBottom: 16,
  },
  positionSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 10,
  },
  positionRow: {
    marginHorizontal: 8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  positionRowActive: {
    borderColor: '#2f7a3f',
    backgroundColor: '#eef6f0',
  },
  positionRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  positionRowStatus: {
    fontSize: 13,
    color: '#9aa1a8',
    marginTop: 2,
  },
  positionRowStatusPlaced: {
    color: '#2f7a3f',
    fontWeight: '600',
  },
  placementSheet: {
    paddingBottom: 4,
  },
  placementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  placementHint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  placementActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 4,
  },
  placementButtonPressed: {
    opacity: 0.85,
  },
  cancelPlacement: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPlacementText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  confirmPlacement: {
    flex: 1.35,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPlacementDisabled: {
    backgroundColor: '#b8c4bb',
  },
  confirmPlacementText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  confirmPlacementTextDisabled: {
    color: '#f0f2f0',
  },
  generateButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2f7a3f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
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
