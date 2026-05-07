/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { ActiveRouteStatsBar } from '../components/route-sheet/ActiveRouteStatsBar';
import { RouteActiveSheet } from '../components/route-sheet/RouteActiveSheet';
import { RouteGeneratedSheet } from '../components/route-sheet/RouteGeneratedSheet';
import { RouteRequestSheet } from '../components/route-sheet/RouteRequestSheet';
import { useUserLocation } from '../hooks/userLocation';
import { generateRoute } from '../lib/api';
import { RouteResponse } from '../types/route';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useCompassHeading } from '../hooks/userCompassHeading';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

const PREVIEW_GENERATED_SHEET = false;

const heading = useCompassHeading();
const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const styleURL = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${mapTilerKey}`;

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
  const GENERATED_EXPANDED_HEIGHT = 516;
  const REQUEST_COLLAPSED_HEIGHT = 384;
  const GENERATED_COLLAPSED_HEIGHT = 384;
  const ACTIVE_EXPANDED_HEIGHT = 384;
  const ACTIVE_COLLAPSED_HEIGHT = 44;
  const REQUEST_COLLAPSED_TRANSLATE =
    EXPANDED_HEIGHT - REQUEST_COLLAPSED_HEIGHT;
  const GENERATED_EXPANDED_TRANSLATE =
    EXPANDED_HEIGHT - GENERATED_EXPANDED_HEIGHT;
  const sheetTranslateY = useRef(
    new Animated.Value(
      PREVIEW_GENERATED_SHEET
        ? GENERATED_EXPANDED_TRANSLATE
        : REQUEST_COLLAPSED_TRANSLATE
    )
  ).current;
  const sliderX = useRef(new Animated.Value(0)).current;
  const sliderXRef = useRef(0);
  const sliderStartRef = useRef(0);
  const distanceRef = useRef(MIN_DISTANCE);
  const frameRef = useRef<number | null>(null);
  const from = route.params?.from;
  const activeRouteParam = route.params?.activeRoute;
  const { location } = useUserLocation();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [distanceKm, setDistanceKm] = useState(MIN_DISTANCE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActiveHud, setShowActiveHud] = useState(false);
  const [sheetMode, setSheetMode] = useState<
    'request' | 'generated' | 'active'
  >(PREVIEW_GENERATED_SHEET ? 'generated' : 'request');
  const [generatedRoute, setGeneratedRoute] = useState<RouteResponse | null>(
    PREVIEW_GENERATED_SHEET ? PREVIEW_ROUTE : null
  );
  const activeStats = {
    timeMin: 9,
    checkpointDone: 0,
    checkpointTotal: generatedRoute?.checkpoints.length ?? 0,
    distanceToNextM: 300,
    paceMinPerKm: '9:33/km',
  };
  const activeRouteName =
    (generatedRoute as (RouteResponse & { name?: string }) | null)?.name ??
    'Genererad rutt';
  const minTranslate =
    sheetMode === 'active'
      ? EXPANDED_HEIGHT - ACTIVE_EXPANDED_HEIGHT
      : sheetMode === 'generated'
        ? EXPANDED_HEIGHT - GENERATED_EXPANDED_HEIGHT
        : 0;
  const collapsedHeight =
    sheetMode === 'active'
      ? ACTIVE_COLLAPSED_HEIGHT
      : sheetMode === 'generated'
        ? GENERATED_COLLAPSED_HEIGHT
        : REQUEST_COLLAPSED_HEIGHT;
  const maxTranslate = EXPANDED_HEIGHT - collapsedHeight;

  useEffect(() => {
    if (!activeRouteParam) return;
    setGeneratedRoute(activeRouteParam);
    setSheetMode('active');
  }, [activeRouteParam]);

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
    setIsExpanded(toValue === minTranslate);
  };

  useEffect(() => {
    sheetTranslateY.stopAnimation((currentValue) => {
      const clamped = Math.max(
        minTranslate,
        Math.min(maxTranslate, currentValue)
      );
      sheetTranslateY.setValue(clamped);
      setIsExpanded(clamped === minTranslate);
    });
  }, [minTranslate, maxTranslate, sheetTranslateY]);

  useEffect(() => {
    if (sheetMode === 'request') {
      sheetTranslateY.stopAnimation();
      sheetTranslateY.setValue(REQUEST_COLLAPSED_TRANSLATE);
      setIsExpanded(false);
    } else if (sheetMode === 'generated') {
      sheetTranslateY.stopAnimation();
      sheetTranslateY.setValue(GENERATED_EXPANDED_TRANSLATE);
      setIsExpanded(true);
    }
  }, [
    sheetMode,
    GENERATED_EXPANDED_TRANSLATE,
    REQUEST_COLLAPSED_TRANSLATE,
    sheetTranslateY,
  ]);

  useEffect(() => {
    if (sheetMode !== 'active') {
      setShowActiveHud(false);
      return;
    }
    const id = sheetTranslateY.addListener(({ value }) => {
      // Show HUD when sheet is close to collapsed (handle-only) position.
      setShowActiveHud(value > maxTranslate - 6);
    });
    return () => sheetTranslateY.removeListener(id);
  }, [sheetMode, maxTranslate, sheetTranslateY]);

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
          const next = Math.max(
            minTranslate,
            Math.min(maxTranslate, maxTranslate + gesture.dy)
          );
          sheetTranslateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -20) {
            animateSheetTo(minTranslate);
          } else if (gesture.dy > 20) {
            animateSheetTo(maxTranslate);
          } else {
            sheetTranslateY.stopAnimation((currentValue) => {
              const midpoint = (minTranslate + maxTranslate) / 2;
              animateSheetTo(
                currentValue < midpoint ? minTranslate : maxTranslate
              );
            });
          }
        },
      }),
    [minTranslate, maxTranslate, sheetTranslateY]
  );

  const sliderMinX = LINE_INSET - THUMB_SIZE / 2;
  const sliderMaxX = Math.max(
    sliderMinX,
    sliderWidth - LINE_INSET - THUMB_SIZE / 2
  );
  const sliderTravel = Math.max(1, sliderMaxX - sliderMinX);

  const updateSliderX = (locationX: number) => {
    const nextX = Math.max(
      sliderMinX,
      Math.min(sliderMaxX, locationX - THUMB_SIZE / 2)
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
            Math.min(sliderMaxX, sliderStartRef.current + gesture.dx)
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
    [sliderWidth, sliderMaxX, sliderMinX]
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
      {/* Karta */}
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={styleURL}
    >
      <Camera
        initialViewState={{
          center: location
            ? [location.longitude, location.latitude]
            : [18.0656, 59.3327],
          zoom: 14,
        }}
        trackUserLocation="default"
      />
    </Map>

      {/* Kompass */}
      <View style={styles.compass}>
        <View style={[
          styles.compassInner,
          { transform: [{ rotate: `${-heading}deg` }] }
        ]}>
          <Text style={styles.compassArrow}>↑</Text>
        </View>
        <Text style={styles.compassLabel}>N</Text>
      </View>

      <View style={styles.content} />
      {sheetMode === 'active' && generatedRoute && showActiveHud && (
        <>
          <ActiveRouteStatsBar variant="hud" stats={activeStats} />
          <View style={styles.activeHudPill}>
            <View style={styles.activeHudArrowWrap}>
              <View style={styles.activeHudArrowLine} />
              <View style={styles.activeHudArrowHeadLeft} />
              <View style={styles.activeHudArrowHeadRight} />
            </View>
            <Text style={styles.activeHudPillText}>
              {activeStats.distanceToNextM} m till nästa checkpoint
            </Text>
          </View>
          <View style={styles.activeHudBottomActions}>
            <Pressable
              style={styles.activeHudFetchButton}
              onPress={() =>
                navigation.navigate('CheckpointTaken', {
                  routeName: activeRouteName,
                  currentCheckpoint: 2,
                  totalCheckpoints: activeStats.checkpointTotal,
                  elapsedMin: activeStats.timeMin,
                  distanceKm: '1,9',
                  paceMinPerKm: '10:5',
                })
              }
            >
              <Text style={styles.activeHudFetchText}>Hämta checkpoint</Text>
              <Text style={styles.activeHudFetchArrow}>›</Text>
            </Pressable>
            <Pressable
              style={styles.activeHudEmergencyButton}
              onPress={() => {}}
            >
              <Text style={styles.activeHudEmergencyText}>Nödknapp</Text>
            </Pressable>
          </View>
        </>
      )}
      <Animated.View
        style={[
          styles.filterSheet,
          {
            height: EXPANDED_HEIGHT,
            transform: [{ translateY: sheetTranslateY }],
          },
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
        ) : sheetMode === 'generated' && generatedRoute ? (
          <RouteGeneratedSheet
            route={generatedRoute}
            onGenerateNew={handleGenerateRoute}
            onStartOrienteering={() =>
              navigation.navigate('RouteStarted', { route: generatedRoute })
            }
            onBackToRequest={() => {
              setSheetMode('request');
            }}
          />
        ) : sheetMode === 'active' && generatedRoute ? (
          <RouteActiveSheet
            route={generatedRoute}
            terrain={activeStats}
            onAbort={() => {
              setSheetMode('generated');
            }}
            onEmergency={() => {}}
            onFetchCheckpoint={() =>
              navigation.navigate('CheckpointTaken', {
                routeName: activeRouteName,
                currentCheckpoint: 2,
                totalCheckpoints: activeStats.checkpointTotal,
                elapsedMin: activeStats.timeMin,
                distanceKm: '1,9',
                paceMinPerKm: '10:5',
              })
            }
          />
        ) : null}
      </Animated.View>
      <BottomNav
        navigation={navigation}
        activeTab="CreateRoute"
        fromOrigin={from}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: {
    flex: 1,
    paddingBottom: 72,
  },
  compass: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'white',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  compassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassArrow: {
    fontSize: 24,
    color: '#e53e3e',
    fontWeight: 'bold',
    lineHeight: 26,
  },
  compassLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: -2,
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
  activeHudPill: {
    position: 'absolute',
    top: 151,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeHudArrowWrap: {
    width: 12,
    height: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHudArrowLine: {
    width: 2,
    height: 9,
    backgroundColor: '#1f2933',
    borderRadius: 1,
  },
  activeHudArrowHeadLeft: {
    position: 'absolute',
    top: 1,
    left: 3,
    width: 2,
    height: 5,
    backgroundColor: '#1f2933',
    transform: [{ rotate: '50deg' }],
    borderRadius: 1,
  },
  activeHudArrowHeadRight: {
    position: 'absolute',
    top: 1,
    right: 3,
    width: 2,
    height: 5,
    backgroundColor: '#1f2933',
    transform: [{ rotate: '-50deg' }],
    borderRadius: 1,
  },
  activeHudPillText: {
    fontSize: 13,
    color: '#1f2933',
    fontWeight: '600',
  },
  activeHudBottomActions: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 123,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeHudEmergencyButton: {
    backgroundColor: '#c0392b',
    borderRadius: 18,
    height: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeHudEmergencyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  activeHudFetchButton: {
    height: 36,
    borderRadius: 14,
    backgroundColor: '#7aa681',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  activeHudFetchText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  activeHudFetchArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginTop: -1,
  },
});