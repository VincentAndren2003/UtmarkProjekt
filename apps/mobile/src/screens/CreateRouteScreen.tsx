import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { RouteGeneratedSheet } from '../components/route-sheet/RouteGeneratedSheet';
import { RouteRequestSheet } from '../components/route-sheet/RouteRequestSheet';
import { useUserLocation } from '../hooks/userLocation';
import { generateRoute } from '../lib/api';
import { RouteResponse } from '../types/route';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

const PREVIEW_GENERATED_SHEET = true;

const PREVIEW_ROUTE: RouteResponse = {
  id: 'preview-route',
  start: { latitude: 59.334591, longitude: 18.06324 },
  distance: 5,
  checkpoints: [
    {
      id: 'checkpoint-1',
      coordinate: { latitude: 59.336, longitude: 18.07 },
      radius: 20,
      completed: false,
    },
    {
      id: 'checkpoint-2',
      coordinate: { latitude: 59.33, longitude: 18.064 },
      radius: 20,
      completed: false,
    },
    {
      id: 'checkpoint-3',
      coordinate: { latitude: 59.338, longitude: 18.061 },
      radius: 20,
      completed: false,
    },
  ],
};

export function CreateRouteScreen({ navigation, route }: Props) {
  const MIN_DISTANCE = 1;
  const MAX_DISTANCE = 30;
  const THUMB_SIZE = 20;
  const LINE_INSET = 10;
  const EXPANDED_HEIGHT = 560;
  const COLLAPSED_HEIGHT = 384;
  const MAX_TRANSLATE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
  const sheetTranslateY = useRef(new Animated.Value(MAX_TRANSLATE)).current;
  const sliderX = useRef(new Animated.Value(0)).current;
  const sliderXRef = useRef(0);
  const sliderStartRef = useRef(0);
  const distanceRef = useRef(MIN_DISTANCE);
  const frameRef = useRef<number | null>(null);
  const from = route.params?.from;
  const { location } = useUserLocation();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [distanceKm, setDistanceKm] = useState(MIN_DISTANCE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sheetMode, setSheetMode] = useState<'request' | 'generated'>(
    PREVIEW_GENERATED_SHEET ? 'generated' : 'request'
  );
  const [generatedRoute, setGeneratedRoute] = useState<RouteResponse | null>(
    PREVIEW_GENERATED_SHEET ? PREVIEW_ROUTE : null
  );

  const filterChips = [
    'Vid vatten',
    'Plant',
    'Kuperat',
    'Barnvagn',
    'Klippor',
    'Skog',
    'Stad',
  ];

  const animateSheetTo = (toValue: number) => {
    Animated.spring(sheetTranslateY, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
    setIsExpanded(toValue === 0);
  };

  const toggleFilter = (chip: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) {
        next.delete(chip);
      } else {
        next.add(chip);
      }
      return next;
    });
  };

  const handleGenerateRoute = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await generateRoute(
        location ?? { latitude: 59.334591, longitude: 18.06324 },
        distanceKm,
        { filters: Array.from(activeFilters) }
      );
      setGeneratedRoute(response);
      setSheetMode('generated');
      animateSheetTo(0);
    } catch (error) {
      console.error('Kunde inte generera rutt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, Math.min(MAX_TRANSLATE, MAX_TRANSLATE + gesture.dy));
          sheetTranslateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -20) {
            animateSheetTo(0);
          } else if (gesture.dy > 20) {
            animateSheetTo(MAX_TRANSLATE);
          } else {
            sheetTranslateY.stopAnimation((currentValue) => {
              animateSheetTo(currentValue < MAX_TRANSLATE / 2 ? 0 : MAX_TRANSLATE);
            });
          }
        },
      }),
    [MAX_TRANSLATE, sheetTranslateY],
  );

  const sliderMinX = LINE_INSET - THUMB_SIZE / 2;
  const sliderMaxX = Math.max(
    sliderMinX,
    sliderWidth - LINE_INSET - THUMB_SIZE / 2,
  );
  const sliderTravel = Math.max(1, sliderMaxX - sliderMinX);

  const updateSliderX = (locationX: number) => {
    const nextX = Math.max(
      sliderMinX,
      Math.min(sliderMaxX, locationX - THUMB_SIZE / 2),
    );
    sliderX.setValue(nextX);
  };

  const getDistanceFromX = (xValue: number) => {
    const ratio = (xValue - sliderMinX) / sliderTravel;
    return Math.round(MIN_DISTANCE + ratio * (MAX_DISTANCE - MIN_DISTANCE));
  };

  const updateDistanceLive = (xValue: number) => {
    const next = getDistanceFromX(xValue);
    if (next !== distanceRef.current) {
      distanceRef.current = next;
      setDistanceKm(next);
    }
  };

  useEffect(() => {
    const id = sliderX.addListener(({ value }) => {
      sliderXRef.current = value;
    });
    return () => sliderX.removeListener(id);
  }, [sliderX]);

  useEffect(() => {
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const sliderPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: (evt) => {
          if (!sliderWidth) return;
          sliderStartRef.current = sliderXRef.current;
          updateSliderX(evt.nativeEvent.locationX);
          updateDistanceLive(sliderXRef.current);
        },
        onPanResponderMove: (_, gesture) => {
          if (!sliderWidth) return;
          const nextX = Math.max(
            sliderMinX,
            Math.min(sliderMaxX, sliderStartRef.current + gesture.dx),
          );
          sliderX.setValue(nextX);
          sliderXRef.current = nextX;

          if (frameRef.current == null) {
            frameRef.current = requestAnimationFrame(() => {
              updateDistanceLive(sliderXRef.current);
              frameRef.current = null;
            });
          }
        },
        onPanResponderRelease: () => {
          if (frameRef.current != null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
          }
          updateDistanceLive(sliderXRef.current);
        },
      }),
    [sliderWidth, sliderMaxX, sliderMinX],
  );

  const handleSliderLayout = (rawWidth: number) => {
    const width = Math.max(1, rawWidth);
    setSliderWidth(width);
    const minX = LINE_INSET - THUMB_SIZE / 2;
    const maxX = Math.max(minX, width - LINE_INSET - THUMB_SIZE / 2);
    const travel = Math.max(1, maxX - minX);
    const ratio = (distanceKm - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
    sliderX.setValue(minX + ratio * travel);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapBackdrop} />
      <View style={styles.content} />
      <Animated.View
        style={[
          styles.filterSheet,
          { height: EXPANDED_HEIGHT, transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHandleSecondary} />
        </View>
        {sheetMode === 'request' ? (
          <RouteRequestSheet
            distanceKm={distanceKm}
            activeFilters={activeFilters}
            filterChips={filterChips}
            isExpanded={isExpanded}
            isGenerating={isGenerating}
            sliderX={sliderX}
            sliderPanHandlers={sliderPanResponder.panHandlers}
            onSliderLayout={handleSliderLayout}
            onToggleFilter={toggleFilter}
            onGenerate={handleGenerateRoute}
          />
        ) : generatedRoute ? (
          <RouteGeneratedSheet
            route={generatedRoute}
            onGenerateNew={handleGenerateRoute}
            onStartOrienteering={() => navigation.navigate('Map')}
            onBackToRequest={() => setSheetMode('request')}
          />
        ) : null}
      </Animated.View>
      <BottomNav navigation={navigation} activeTab="CreateRoute" fromOrigin={from} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  mapBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#cfe6c9',
  },
  content: {
    flex: 1,
    paddingBottom: 72,
  },
  filterSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 72,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e8eb',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  sheetHandle: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#222',
  },
  sheetHandleSecondary: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#222',
    marginTop: 3,
  },
});
