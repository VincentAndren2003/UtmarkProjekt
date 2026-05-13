/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import { ActiveRouteStatsBar } from '../components/route-sheet/ActiveRouteStatsBar';
import { RouteActiveSheet } from '../components/route-sheet/RouteActiveSheet';
import { RouteGeneratedSheet } from '../components/route-sheet/RouteGeneratedSheet';
import { RouteRequestSheet } from '../components/route-sheet/RouteRequestSheet';
import { useUserLocation } from '../hooks/userLocation';
import { generateRoute, getMyProfile } from '../lib/api';
import { RouteResponse } from '../types/route';
import { Route } from '../models/Route';
import { Checkpoint } from '../models/Checkpoint';

import { GeneratedRouteLayer } from '../components/GeneratedRouteLayer';
import MapView, { UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

const FETCH_RADIUS_M = 50;
const PREVIEW_GENERATED_SHEET = false;

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
  const MAX_DISTANCE = 20;
  const THUMB_SIZE = 20;
  const LINE_INSET = 10;
  const EXPANDED_HEIGHT = 560;
  const GENERATED_EXPANDED_HEIGHT = 516;
  const REQUEST_COLLAPSED_HEIGHT = 384;
  const GENERATED_COLLAPSED_HEIGHT = 384;
  const ACTIVE_EXPANDED_HEIGHT = 384;
  const ACTIVE_COLLAPSED_HEIGHT = 66;
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
  const [greetingFirstName, setGreetingFirstName] = useState<string | null>(
    null
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const profile = await getMyProfile();
        if (!alive) return;
        const first = (profile.fullName ?? '').trim().split(/\s+/)[0] || null;
        setGreetingFirstName(first);
      } catch {
        if (alive) setGreetingFirstName(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [outOfRangeVisible, setOutOfRangeVisible] = useState(false);

  const distanceToNextCheckpointM = useMemo(() => {
    if (!location || !generatedRoute) return null;
    const nextCp = generatedRoute.checkpoints.find((cp) => !cp.completed);
    if (!nextCp) return null;
    const checkpoint = new Checkpoint(
      nextCp.id,
      nextCp.coordinate,
      nextCp.completed,
      nextCp.radius
    );
    return checkpoint.distanceTo(location);
  }, [location, generatedRoute]);

  const canFetchCheckpoint =
    distanceToNextCheckpointM !== null &&
    distanceToNextCheckpointM <= FETCH_RADIUS_M;

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

  const handleFetchCheckpoint = () => {
    if (!location || !generatedRoute) return;
    if (!canFetchCheckpoint) return;

    const routeInstance = new Route(
      generatedRoute.id,
      generatedRoute.start,
      generatedRoute.distance
    );
    routeInstance.checkpoints = generatedRoute.checkpoints.map(
      (cp) => new Checkpoint(cp.id, cp.coordinate, cp.completed, cp.radius)
    );

    const completed = routeInstance.tryCompleteCurrentCheckpoint(location);

    if (!completed) {
      console.log('Du är inte inom checkpointens radie');
      return;
    }

    const nextCheckpoint = routeInstance.isFinished()
      ? activeStats.checkpointTotal
      : activeStats.checkpointDone + 1;

    navigation.navigate('CheckpointTaken', {
      routeName: activeRouteName,
      currentCheckpoint: nextCheckpoint,
      totalCheckpoints: activeStats.checkpointTotal,
      elapsedMin: activeStats.timeMin,
      distanceKm: '1,9',
      paceMinPerKm: '10:5',
    });
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
  //

  /** Styling för Google Maps kartan **/
  const roadFIll = '#E7AB83';
  const roadOutline = '#000000';
  const waterFIll = '#009ee2';
  const forestFIll = '#ffffff';
  const parkFill = '#FFBA36';

  const mapStyle = [
    {
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: roadFIll,
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: roadOutline,
        },
        {
          weight: 0.5,
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: waterFIll,
        },
      ],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: forestFIll,
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: parkFill,
        },
      ],
    },
  ];

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : {
        latitude: 59.334591,
        longitude: 18.06324,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      {/* Karta i bakgrunden */}
      <View style={styles.mapBackdrop}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          showsBuildings={false}
          showsCompass={false}
          initialRegion={initialRegion}
        >
          {generatedRoute && <GeneratedRouteLayer route={generatedRoute} />}

          <UrlTile
            urlTemplate={'http://79.76.60.222:3000/tiles/{z}/{x}/{y}.png'}
            maximumZ={20}
            minimumZ={12}
            shouldReplaceMapContent={false}
            tileSize={512}
            zIndex={1}
          />
        </MapView>
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
              style={[
                styles.activeHudFetchButton,
                !canFetchCheckpoint && styles.activeHudFetchButtonDisabled,
              ]}
              onPress={
                canFetchCheckpoint
                  ? handleFetchCheckpoint
                  : () => setOutOfRangeVisible(true)
              }
            >
              <Ionicons
                name={canFetchCheckpoint ? 'checkmark-circle' : 'lock-closed'}
                size={14}
                color="#fff"
                style={styles.activeHudFetchIcon}
              />
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
          {sheetMode === 'active' && (
            <Animated.Text
              style={[
                styles.sheetHandleHint,
                {
                  opacity: sheetTranslateY.interpolate({
                    inputRange: [minTranslate, maxTranslate],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              Dra upp för mer information
            </Animated.Text>
          )}
        </View>
        {sheetMode === 'request' ? (
          <RouteRequestSheet
            greetingFirstName={greetingFirstName}
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
            onFetchCheckpoint={handleFetchCheckpoint}
            canFetchCheckpoint={canFetchCheckpoint}
          />
        ) : null}
      </Animated.View>

      <BottomNav
        navigation={navigation}
        activeTab="CreateRoute"
        fromOrigin={from}
      />

      <Modal
        visible={outOfRangeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOutOfRangeVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOutOfRangeVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Ionicons
              name="lock-closed"
              size={28}
              color="#3E7A44"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>För långt från checkpoint</Text>
            <Text style={styles.modalBody}>
              Ta dig närmare nästa checkpoint för att kunna hämta den. Du måste
              vara inom {FETCH_RADIUS_M} meter.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setOutOfRangeVisible(false)}
            >
              <Text style={styles.modalButtonText}>Okej</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  sheetHandleHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    letterSpacing: 0.2,
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
    bottom: 145,
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
  activeHudFetchButtonDisabled: {
    backgroundColor: '#a8aeb5',
  },
  activeHudFetchIcon: {
    marginRight: 6,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: '#4a5763',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  modalButton: {
    height: 40,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: '#3E7A44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
