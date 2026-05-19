/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { EndpointPinMarker } from '../components/EndpointPinMarker';
import { PlacementTapHint } from '../components/PlacementTapHint';
import {
  PlacementMode,
  RouteRequestSheet,
} from '../components/route-sheet/RouteRequestSheet';
import { useUserLocation } from '../hooks/userLocation';
import {
  completeRun,
  generateRoute,
  getMyProfile,
  savePersistedRoute,
  startRun,
} from '../lib/api';
import { Coordinate, RouteResponse } from '../types/route';
import { Route } from '../models/Route';
import { Checkpoint } from '../models/Checkpoint';

import { useTracking } from '../hooks/useTracking';

import { GeneratedRouteLayer } from '../components/GeneratedRouteLayer';
import MapView, {
  Marker,
  Region,
  UrlTile,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

const FETCH_RADIUS_M = 50;
const PREVIEW_GENERATED_SHEET = false;
const REQUEST_SHEET_BOTTOM_OFFSET = 86;

// Beräknar luftlinjeavstånd i meter mellan två GPS-koordinater (Haversine-formeln).
function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Summerar sträckan mellan alla GPS-punkter i en löprunda (punkt för punkt).
function sumTrackDistanceM(points: { lat: number; long: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(
      { latitude: points[i - 1].lat, longitude: points[i - 1].long },
      { latitude: points[i].lat, longitude: points[i].long }
    );
  }
  return total;
}

// Formaterar tempo som min:sek per km, t.ex. "9:33/km". Returnerar "—" om för lite data.
function formatPace(elapsedSeconds: number, distanceMeters: number): string {
  if (distanceMeters < 10 || elapsedSeconds < 1) return '—';
  const km = distanceMeters / 1000;
  const minPerKm = elapsedSeconds / 60 / km;
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

// Formaterar meter till kilometer med svensk decimal, t.ex. 1920 m → "1,9".
function formatDistanceKm(distanceMeters: number): string {
  return (distanceMeters / 1000).toFixed(1).replace('.', ',');
}

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
  const insets = useSafeAreaInsets();
  const MIN_DISTANCE = 1;
  const MAX_DISTANCE = 20;
  const THUMB_SIZE = 20;
  const LINE_INSET = 10;
  const EXPANDED_HEIGHT = 560;
  const GENERATED_EXPANDED_HEIGHT = 516;
  const REQUEST_SHEET_HEIGHT = 410;
  const PLACEMENT_COLLAPSED_HEIGHT = 184;
  const BOTTOM_NAV_HEIGHT = 72;
  const GENERATED_COLLAPSED_HEIGHT = 384;
  const ACTIVE_EXPANDED_HEIGHT = 384;
  const ACTIVE_COLLAPSED_HEIGHT = 66;
  const GENERATED_EXPANDED_TRANSLATE =
    EXPANDED_HEIGHT - GENERATED_EXPANDED_HEIGHT;
  const sheetTranslateY = useRef(
    new Animated.Value(
      PREVIEW_GENERATED_SHEET ? GENERATED_EXPANDED_TRANSLATE : 0
    )
  ).current;
  const sliderX = useRef(new Animated.Value(0)).current;
  const sliderXRef = useRef(0);
  const sliderStartRef = useRef(0);
  const distanceRef = useRef(MIN_DISTANCE);
  const frameRef = useRef<number | null>(null);
  const from = route.params?.from;
  const activeRouteParam = route.params?.activeRoute;
  const activeRunIdParam = route.params?.runId;
  const activeSavedRouteIdParam = route.params?.savedRouteId;
  const { location } = useUserLocation();
  const [distanceKm, setDistanceKm] = useState(MIN_DISTANCE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
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
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const [draftPlacementPin, setDraftPlacementPin] = useState<Coordinate | null>(
    null
  );
  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);
  const [mapInitialRegion, setMapInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);
  const mapCenterRef = useRef<Coordinate>({
    latitude: 59.334591,
    longitude: 18.06324,
  });
  const mapDeltaRef = useRef({
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const userLocationCenteredRef = useRef(false);
  const pendingUserCenterRef = useRef<Coordinate | null>(null);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [trackDistanceM, setTrackDistanceM] = useState(0);
  const [runId, setRunId] = useState<string | null>(activeRunIdParam ?? null);
  const [savedRouteId, setSavedRouteId] = useState<string | null>(
    activeSavedRouteIdParam ?? null
  );
  const [isStartingRun, setIsStartingRun] = useState(false);

  const {
    isTracking,
    startTracking,
    recordVisit,
    stopTracking,
    getResults,
    errorMsg,
  } = useTracking();

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

  const activeStats = useMemo(
    () => ({
      timeMin: Math.floor(elapsedSeconds / 60),
      checkpointDone:
        generatedRoute?.checkpoints.filter((cp) => cp.completed).length ?? 0,
      checkpointTotal: generatedRoute?.checkpoints.length ?? 0,
      distanceToNextM: Math.round(distanceToNextCheckpointM ?? 0),
      paceMinPerKm: formatPace(elapsedSeconds, trackDistanceM),
    }),
    [elapsedSeconds, generatedRoute, distanceToNextCheckpointM, trackDistanceM]
  );

  const beginActiveRun = () => {
    setRunStartedAt((prev) => prev ?? Date.now());
    setElapsedSeconds(0);
    setTrackDistanceM(0);
  };

  const resetActiveRun = () => {
    setRunStartedAt(null);
    setElapsedSeconds(0);
    setTrackDistanceM(0);
  };

  useEffect(() => {
    if (sheetMode !== 'active' || runStartedAt == null) return;
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - runStartedAt) / 1000));
      setTrackDistanceM(sumTrackDistanceM(getResults().movement));
    }, 1000);
    return () => clearInterval(id);
  }, [sheetMode, runStartedAt, getResults]);
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
    placementMode && sheetMode === 'request'
      ? PLACEMENT_COLLAPSED_HEIGHT
      : sheetMode === 'active'
        ? ACTIVE_COLLAPSED_HEIGHT
        : sheetMode === 'generated'
          ? GENERATED_COLLAPSED_HEIGHT
          : REQUEST_SHEET_HEIGHT;
  const maxTranslate = EXPANDED_HEIGHT - collapsedHeight;
  const isFixedHeightSheet = sheetMode === 'request';

  useEffect(() => {
    if (!activeRouteParam) return;
    setGeneratedRoute(activeRouteParam);
    setSheetMode('active');
    beginActiveRun();
    if (activeRunIdParam) setRunId(activeRunIdParam);
    if (activeSavedRouteIdParam) setSavedRouteId(activeSavedRouteIdParam);
  }, [activeRouteParam, activeRunIdParam, activeSavedRouteIdParam]);

  useEffect(() => {
    if (!route.params?.runFinished) return;
    stopTracking();
    resetActiveRun();
    setGeneratedRoute(null);
    setSheetMode('request');
    setRunId(null);
    setSavedRouteId(null);
    setShowActiveHud(false);
    navigation.setParams({
      runFinished: undefined,
      activeRoute: undefined,
      runId: undefined,
      savedRouteId: undefined,
    });
  }, [route.params?.runFinished, navigation, stopTracking]);

  const animateSheetTo = (toValue: number) => {
    Animated.spring(sheetTranslateY, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
  };

  useEffect(() => {
    sheetTranslateY.stopAnimation((currentValue) => {
      const clamped = Math.max(
        minTranslate,
        Math.min(maxTranslate, currentValue)
      );
      sheetTranslateY.setValue(clamped);
    });
  }, [minTranslate, maxTranslate, sheetTranslateY]);

  useEffect(() => {
    if (sheetMode === 'request') {
      sheetTranslateY.stopAnimation();
      sheetTranslateY.setValue(0);
    } else if (sheetMode === 'generated') {
      sheetTranslateY.stopAnimation();
      sheetTranslateY.setValue(GENERATED_EXPANDED_TRANSLATE);
    }
  }, [sheetMode, GENERATED_EXPANDED_TRANSLATE, sheetTranslateY]);

  const isPlacementSheet = placementMode !== null && sheetMode === 'request';
  const sheetHeight = isPlacementSheet
    ? PLACEMENT_COLLAPSED_HEIGHT
    : sheetMode === 'request'
      ? REQUEST_SHEET_HEIGHT
      : EXPANDED_HEIGHT;

  const mapBottomPadding = useMemo(() => {
    if (isPlacementSheet) {
      return PLACEMENT_COLLAPSED_HEIGHT + REQUEST_SHEET_BOTTOM_OFFSET;
    }
    if (sheetMode === 'request') {
      return REQUEST_SHEET_HEIGHT + REQUEST_SHEET_BOTTOM_OFFSET;
    }
    if (sheetMode === 'generated') {
      return GENERATED_COLLAPSED_HEIGHT + BOTTOM_NAV_HEIGHT;
    }
    return ACTIVE_COLLAPSED_HEIGHT + BOTTOM_NAV_HEIGHT;
  }, [isPlacementSheet, sheetMode]);

  const mapPadding = useMemo(
    () => ({
      top: insets.top,
      right: 0,
      bottom: mapBottomPadding,
      left: 0,
    }),
    [insets.top, mapBottomPadding]
  );

  useEffect(() => {
    if (!location || placementMode || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: mapDeltaRef.current.latitudeDelta,
        longitudeDelta: mapDeltaRef.current.longitudeDelta,
      },
      250
    );
  }, [mapBottomPadding, placementMode]);

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

  const centerMapOnUser = (coord: Coordinate) => {
    if (userLocationCenteredRef.current || placementMode) return;
    const region: Region = {
      latitude: coord.latitude,
      longitude: coord.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    mapCenterRef.current = coord;
    mapDeltaRef.current = {
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    };
    setMapInitialRegion(region);
    if (!mapRef.current) {
      pendingUserCenterRef.current = coord;
      return;
    }
    mapRef.current.animateToRegion(region, 400);
    userLocationCenteredRef.current = true;
    pendingUserCenterRef.current = null;
  };

  useEffect(() => {
    if (!location) return;
    centerMapOnUser(location);
  }, [location, placementMode]);

  const handleMapReady = () => {
    const pending = pendingUserCenterRef.current;
    if (pending && !userLocationCenteredRef.current && !placementMode) {
      centerMapOnUser(pending);
      return;
    }
    if (location && !userLocationCenteredRef.current && !placementMode) {
      centerMapOnUser(location);
    }
  };

  const animateMapTo = (coord: Coordinate) => {
    mapRef.current?.animateToRegion(
      {
        ...coord,
        latitudeDelta: mapDeltaRef.current.latitudeDelta,
        longitudeDelta: mapDeltaRef.current.longitudeDelta,
      },
      0
    );
  };

  const beginPlacement = (
    mode: 'start' | 'end',
    existing: Coordinate | null
  ) => {
    if (existing) {
      setDraftPlacementPin(existing);
      mapCenterRef.current = existing;
      animateMapTo(existing);
    } else {
      setDraftPlacementPin(null);
    }
    setPlacementMode(mode);
  };

  const handleSelectStart = () => {
    beginPlacement('start', startPoint);
  };

  const handleSelectEnd = () => {
    beginPlacement('end', endPoint);
  };

  const handleMapPress = (coord: Coordinate) => {
    if (!placementMode) return;
    setDraftPlacementPin(coord);
    mapCenterRef.current = coord;
  };

  const handleConfirmPlacement = () => {
    if (!draftPlacementPin) return;
    const coord = draftPlacementPin;
    if (placementMode === 'start') {
      setStartPoint(coord);
    } else if (placementMode === 'end') {
      setEndPoint(coord);
    }
    setDraftPlacementPin(null);
    setPlacementMode(null);
  };

  const handleCancelPlacement = () => {
    setDraftPlacementPin(null);
    setPlacementMode(null);
  };

  const handleGenerateRoute = async () => {
    if (isGenerating || placementMode) return;
    setIsGenerating(true);
    try {
      const start = startPoint ??
        location ?? { latitude: 59.334591, longitude: 18.06324 };
      const response = await generateRoute(
        start,
        distanceKm,
        endPoint ?? undefined
      );
      setGeneratedRoute(response);
      setSheetMode('generated');
      setRunId(null);
      setSavedRouteId(null);
    } catch (error) {
      console.error('Kunde inte generera rutt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildRunSummary = (
    checkpointDone: number,
    totalCheckpoints: number,
    routeSnapshot: RouteResponse
  ) => ({
    routeName: activeRouteName,
    totalCheckpoints,
    checkpointsCompleted: checkpointDone,
    elapsedMin: Math.floor(elapsedSeconds / 60),
    distanceKm: formatDistanceKm(trackDistanceM),
    paceMinPerKm: formatPace(elapsedSeconds, trackDistanceM),
    plannedDistanceKm: routeSnapshot.distance,
    runId: runId ?? undefined,
    savedRouteId: savedRouteId ?? undefined,
    routeSnapshot,
    from,
  });

  const handleFetchCheckpoint = async () => {
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

    const updatedCheckpoints = routeInstance.checkpoints.map((cp) => ({
      id: cp.id,
      coordinate: { ...cp.coordinate },
      completed: cp.completed,
      radius: cp.radius,
    }));

    const routeSnapshot: RouteResponse = {
      ...generatedRoute,
      checkpoints: updatedCheckpoints,
    };

    setGeneratedRoute(routeSnapshot);

    const checkpointDone = updatedCheckpoints.filter(
      (cp) => cp.completed
    ).length;
    const justCompleted = updatedCheckpoints[checkpointDone - 1];
    recordVisit(
      justCompleted.id,
      justCompleted.coordinate.latitude,
      justCompleted.coordinate.longitude
    );

    const isLastCheckpoint = checkpointDone >= updatedCheckpoints.length;
    const summary = buildRunSummary(
      checkpointDone,
      updatedCheckpoints.length,
      routeSnapshot
    );

    if (isLastCheckpoint) {
      stopTracking();
      if (runId) {
        try {
          await completeRun(runId, {
            durationSeconds: elapsedSeconds,
            checkpointsCompleted: checkpointDone,
            distanceMeters: Math.round(trackDistanceM),
          });
        } catch (err) {
          console.warn('Kunde inte avsluta körning på servern:', err);
        }
      }
      resetActiveRun();
      navigation.navigate('RouteCompleted', summary);
      return;
    }

    navigation.navigate('CheckpointTaken', {
      routeName: summary.routeName,
      currentCheckpoint: checkpointDone,
      totalCheckpoints: summary.totalCheckpoints,
      elapsedMin: summary.elapsedMin,
      distanceKm: summary.distanceKm,
      paceMinPerKm: summary.paceMinPerKm,
    });
  };

  const handleStartOrienteering = async () => {
    if (!generatedRoute || isStartingRun) return;
    setIsStartingRun(true);
    try {
      let persistedRouteId = savedRouteId;
      if (!persistedRouteId) {
        try {
          const saved = await savePersistedRoute(generatedRoute);
          persistedRouteId = saved._id;
          setSavedRouteId(saved._id);
        } catch (err) {
          console.warn('Kunde inte spara rutt — kör lokalt utan runId:', err);
        }
      }

      if (persistedRouteId) {
        try {
          const run = await startRun(persistedRouteId);
          setRunId(run._id);
        } catch (err) {
          console.warn('Kunde inte starta körning på servern:', err);
        }
      }

      setSheetMode('active');
      beginActiveRun();
      startTracking(generatedRoute.id);
      navigation.navigate('RouteStarted', {
        route: generatedRoute,
      });
    } finally {
      setIsStartingRun(false);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => sheetMode !== 'request',
        onMoveShouldSetPanResponder: (_, gesture) =>
          sheetMode !== 'request' && Math.abs(gesture.dy) > 4,
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
    [minTranslate, maxTranslate, sheetMode, sheetTranslateY]
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

  const placementTapHint =
    placementMode === 'start'
      ? 'Tryck på kartan för att placera startposition'
      : 'Tryck på kartan för att placera slutposition';
  const placementMarkerLabel =
    placementMode === 'start'
      ? 'Startposition — tryck på kartan för att flytta'
      : 'Slutposition — tryck på kartan för att flytta';

  return (
    <View style={styles.container}>
      {/* Karta i bakgrunden */}
      <View style={styles.mapBackdrop}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          showsBuildings={false}
          showsCompass={false}
          showsUserLocation
          mapPadding={mapPadding}
          onMapReady={handleMapReady}
          onPress={(event) => handleMapPress(event.nativeEvent.coordinate)}
          initialRegion={
            mapInitialRegion ?? {
              latitude: 59.334591,
              longitude: 18.06324,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }
          }
          onRegionChangeComplete={(region) => {
            mapDeltaRef.current = {
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            };
            if (!placementMode) {
              mapCenterRef.current = {
                latitude: region.latitude,
                longitude: region.longitude,
              };
            }
          }}
        >
          {generatedRoute && <GeneratedRouteLayer route={generatedRoute} />}

          {!generatedRoute && startPoint && placementMode !== 'start' ? (
            <Marker
              coordinate={startPoint}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={10}
              tappable={false}
            >
              <EndpointPinMarker variant="start" />
            </Marker>
          ) : null}
          {!generatedRoute && endPoint && placementMode !== 'end' ? (
            <Marker
              coordinate={endPoint}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={10}
              tappable={false}
            >
              <EndpointPinMarker variant="end" />
            </Marker>
          ) : null}

          {placementMode && draftPlacementPin ? (
            <Marker
              coordinate={draftPlacementPin}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={11}
              tappable={false}
            >
              <EndpointPinMarker
                variant={placementMode}
                label={placementMarkerLabel}
              />
            </Marker>
          ) : null}

          <UrlTile
            urlTemplate={'http://79.76.60.222:3000/tiles/{z}/{x}/{y}.png'}
            maximumZ={20}
            minimumZ={12}
            shouldReplaceMapContent={false}
            tileSize={512}
            zIndex={1}
          />
        </MapView>
        {placementMode && !draftPlacementPin ? (
          <PlacementTapHint
            label={placementTapHint}
            variant={placementMode}
            bottomInset={mapBottomPadding}
          />
        ) : null}
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
              <Text style={styles.activeHudEmergencyText}>Visa position</Text>
            </Pressable>
          </View>
        </>
      )}

      <Animated.View
        style={[
          styles.filterSheet,
          isFixedHeightSheet && styles.filterSheetFixed,
          isPlacementSheet && styles.filterSheetPlacement,
          {
            height: sheetHeight,
            transform: [
              {
                translateY: isFixedHeightSheet ? 0 : sheetTranslateY,
              },
            ],
          },
        ]}
      >
        <View
          {...(isFixedHeightSheet ? {} : panResponder.panHandlers)}
          style={[
            styles.sheetHandleArea,
            isFixedHeightSheet && styles.sheetHandleAreaCompact,
          ]}
        >
          <View style={styles.sheetHandle} />
          {!isFixedHeightSheet ? (
            <View style={styles.sheetHandleSecondary} />
          ) : null}
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
            isGenerating={isGenerating}
            sliderX={sliderX}
            sliderPanHandlers={sliderPanResponder.panHandlers}
            onSliderLayout={handleSliderLayout}
            onGenerate={handleGenerateRoute}
            placementMode={placementMode}
            startPlaced={startPoint !== null}
            endPlaced={endPoint !== null}
            onSelectStart={handleSelectStart}
            onSelectEnd={handleSelectEnd}
            onConfirmPlacement={handleConfirmPlacement}
            onCancelPlacement={handleCancelPlacement}
            placementPinReady={draftPlacementPin !== null}
          />
        ) : sheetMode === 'generated' && generatedRoute ? (
          <RouteGeneratedSheet
            route={generatedRoute}
            onGenerateNew={handleGenerateRoute}
            onStartOrienteering={handleStartOrienteering}
            onBackToRequest={() => {
              setSheetMode('request');
            }}
          />
        ) : sheetMode === 'active' && generatedRoute ? (
          <RouteActiveSheet
            route={generatedRoute}
            terrain={activeStats}
            onAbort={() => {
              if (!generatedRoute) return;
              const checkpointDone = generatedRoute.checkpoints.filter(
                (cp) => cp.completed
              ).length;
              const summary = buildRunSummary(
                checkpointDone,
                generatedRoute.checkpoints.length,
                generatedRoute
              );
              navigation.navigate('CancelRoute', {
                routeName: summary.routeName,
                totalCheckpoints: summary.totalCheckpoints,
                checkpointsCompleted: summary.checkpointsCompleted,
                elapsedMin: summary.elapsedMin,
                distanceKm: summary.distanceKm,
                paceMinPerKm: summary.paceMinPerKm,
                plannedDistanceKm: summary.plannedDistanceKm,
                from: summary.from,
              });
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
  filterSheetFixed: {
    bottom: REQUEST_SHEET_BOTTOM_OFFSET,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterSheetPlacement: {
    paddingTop: 8,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  sheetHandleAreaCompact: {
    paddingBottom: 6,
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
    backgroundColor: '#7aa681',
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
