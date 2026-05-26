/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import BottomSheet, {
  BottomSheetHandle,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useBadgeCelebration } from '../context/BadgeCelebrationContext';
import { BottomNav } from '../components/BottomNav';
import { MapLegendModal } from '../components/MapLegendModal';
import { ActiveRouteStatsBar } from '../components/route-sheet/ActiveRouteStatsBar';
import { RouteActiveSheet } from '../components/route-sheet/RouteActiveSheet';
import { RouteGeneratedSheet } from '../components/route-sheet/RouteGeneratedSheet';
import { EndpointPinMarker } from '../components/EndpointPinMarker';
import { PlacementTapHint } from '../components/PlacementTapHint';
import {
  PlacementMode,
  RouteRequestSheet,
} from '../components/route-sheet/RouteRequestSheet';
import { useRouteSheetMetrics } from '../hooks/useRouteSheetMetrics';
import {
  SHEET_BODY_BOTTOM_PADDING,
  SHEET_BOTTOM_CLEARANCE,
  SHEET_HANDLE_HEIGHT_EXPANDED,
  SHEET_LAYOUT_REFERENCE,
  snapHeightForScreen,
} from '../sheetLayout';
import { useUserLocation } from '../hooks/userLocation';
import {
  completeRun,
  generateRoute,
  getMyProfile,
  savePersistedRoute,
  startRun,
  completeRunStats,
  getMyStats,
  incrementGeneratedStats,
} from '../lib/api';
import {
  getNewUnlockIds,
  getRouteGeneratedCelebrationBadgeIds,
  getRunCompletionCelebrationBadgeIds,
} from '../services/badgeUnlock';
import { getCelebratedBadgeIds } from '../services/celebratedBadgesStorage';
import { Coordinate, RouteResponse } from '../types/route';
import { Route } from '../models/Route';
import { Checkpoint } from '../models/Checkpoint';

import { useTracking } from '../hooks/useTracking';
import { simplifyTrackPoints } from '../utils/trackUtils';
import { formatDurationClock } from '../utils/routeUtils';

import { GeneratedRouteLayer } from '../components/GeneratedRouteLayer';
import MapView, {
  Marker,
  Region,
  UrlTile,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { CustomMapStyle } from '../models/CustomMapStyle';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRoute'>;

const FETCH_RADIUS_M = 25;
/** Close street-level zoom when centering on the user (reference tuning). */
const MAP_USER_LOCATION_DELTA = 0.012;
const PREVIEW_GENERATED_SHEET = false;

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
  const [measuredBottomNavHeight, setMeasuredBottomNavHeight] = useState<
    number | null
  >(null);
  const sheetMetrics = useRouteSheetMetrics(measuredBottomNavHeight);
  const {
    windowHeight,
    expandedSnap,
    placementCollapsed,
    sheetBottomInset,
    activeHudTop,
    activeHudBottom,
    activeHudStatsTop,
  } = sheetMetrics;
  const [requestGreetingHeight, setRequestGreetingHeight] = useState(0);
  const [requestContentHeight, setRequestContentHeight] = useState(0);
  const [generatedBodyHeight, setGeneratedBodyHeight] = useState(0);
  const [activeBodyHeight, setActiveBodyHeight] = useState(0);
  const MIN_DISTANCE = 1;
  const MAX_DISTANCE = 20;
  const THUMB_SIZE = 20;
  const LINE_INSET = 10;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapGestureRef = useRef<NativeViewGestureHandler>(null);
  const [sheetSnapIndex, setSheetSnapIndex] = useState(0);
  const sliderX = useRef(new Animated.Value(0)).current;
  const sliderXRef = useRef(0);
  const sliderStartRef = useRef(0);
  const distanceRef = useRef(MIN_DISTANCE);
  const frameRef = useRef<number | null>(null);
  const from = route.params?.from;
  const activeRouteParam = route.params?.activeRoute;
  const activeRunIdParam = route.params?.runId;
  const activeSavedRouteIdParam = route.params?.savedRouteId;
  const openAsGenerated = route.params?.openAsGenerated;
  const challengeTargetSeconds = route.params?.challengeTargetSeconds;
  const challengeFromName = route.params?.challengeFromName;
  const { location } = useUserLocation();
  const [distanceKm, setDistanceKm] = useState(MIN_DISTANCE);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [showActiveHud, setShowActiveHud] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
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
  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);
  const [mapInitialRegion, setMapInitialRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);
  const mapCenterRef = useRef<Coordinate>({
    latitude: 59.334591,
    longitude: 18.06324,
  });
  const mapDeltaRef = useRef({
    latitudeDelta: MAP_USER_LOCATION_DELTA,
    longitudeDelta: MAP_USER_LOCATION_DELTA,
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
  const { showBadgeCelebration } = useBadgeCelebration();
  const [showUserPosition, setShowUserPosition] = useState(
    !PREVIEW_GENERATED_SHEET
  );

  const showsUserLocationOnMap = sheetMode === 'request' || showUserPosition;

  const toggleUserPosition = () => {
    setShowUserPosition((prev) => {
      const next = !prev;
      if (next && location) {
        animateMapTo(location);
      }
      return next;
    });
  };

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
  const isPlacementSheet = placementMode !== null && sheetMode === 'request';
  const canDragSheet = !isPlacementSheet;
  /**
   * Request sheet: when expanded, drag only from the handle (slider must not move the sheet).
   * When collapsed, allow dragging on the greeting too so the peek is easy to expand.
   */
  const canDragSheetContent =
    canDragSheet && (sheetMode !== 'request' || sheetSnapIndex === 0);

  const requestHandleHeight = SHEET_HANDLE_HEIGHT_EXPANDED + 15;

  const requestCollapsedHeight = useMemo(() => {
    const greeting =
      requestGreetingHeight > 0
        ? requestGreetingHeight
        : snapHeightForScreen(52, windowHeight);
    return requestHandleHeight + greeting;
  }, [requestHandleHeight, requestGreetingHeight, windowHeight]);

  const requestExpandedHeight = useMemo(() => {
    const greeting =
      requestGreetingHeight > 0
        ? requestGreetingHeight
        : snapHeightForScreen(52, windowHeight);
    const content =
      requestContentHeight > 0
        ? requestContentHeight
        : snapHeightForScreen(
            SHEET_LAYOUT_REFERENCE.requestExpanded - 52,
            windowHeight
          );
    return (
      requestHandleHeight +
      greeting +
      content +
      SHEET_BOTTOM_CLEARANCE +
      SHEET_BODY_BOTTOM_PADDING
    );
  }, [
    requestHandleHeight,
    requestGreetingHeight,
    requestContentHeight,
    windowHeight,
  ]);

  const generatedExpandedHeight = useMemo(
    () =>
      expandedSnap(
        generatedBodyHeight,
        SHEET_HANDLE_HEIGHT_EXPANDED,
        SHEET_LAYOUT_REFERENCE.generatedExpanded
      ),
    [expandedSnap, generatedBodyHeight]
  );

  const activeExpandedHeight = useMemo(
    () =>
      expandedSnap(
        activeBodyHeight,
        SHEET_HANDLE_HEIGHT_EXPANDED,
        SHEET_LAYOUT_REFERENCE.activeExpanded
      ),
    [expandedSnap, activeBodyHeight]
  );

  /** Collapsed peek: handle + hint only — per mode, not shared snap height. */
  const collapsedPeekHeight = useCallback(
    (referencePx: number) => snapHeightForScreen(referencePx, windowHeight),
    [windowHeight]
  );

  const generatedCollapsedPeekHeight = useMemo(
    () => collapsedPeekHeight(SHEET_LAYOUT_REFERENCE.generatedCollapsedPeek),
    [collapsedPeekHeight]
  );

  const activeCollapsedPeekHeight = useMemo(
    () => collapsedPeekHeight(SHEET_LAYOUT_REFERENCE.activeCollapsedPeek),
    [collapsedPeekHeight]
  );

  const snapPoints = useMemo(
    () =>
      isPlacementSheet
        ? [placementCollapsed]
        : sheetMode === 'request'
          ? [requestCollapsedHeight, requestExpandedHeight]
          : sheetMode === 'generated'
            ? [generatedCollapsedPeekHeight, generatedExpandedHeight]
            : [activeCollapsedPeekHeight, activeExpandedHeight],
    [
      sheetMode,
      isPlacementSheet,
      placementCollapsed,
      requestCollapsedHeight,
      requestExpandedHeight,
      generatedCollapsedPeekHeight,
      generatedExpandedHeight,
      activeCollapsedPeekHeight,
      activeExpandedHeight,
    ]
  );

  const bottomSheetInset = sheetBottomInset;

  const handleSheetChange = useCallback(
    (index: number) => {
      setSheetSnapIndex(index);
      if (sheetMode === 'active') {
        setShowActiveHud(index === 0);
      }
    },
    [sheetMode]
  );

  useEffect(() => {
    if (!activeRouteParam) return;
    setGeneratedRoute(activeRouteParam);
    if (activeSavedRouteIdParam) setSavedRouteId(activeSavedRouteIdParam);
    if (openAsGenerated) {
      setSheetMode('generated');
      setShowUserPosition(true);
      return;
    }
    setSheetMode('active');
    beginActiveRun();
    if (activeRunIdParam) setRunId(activeRunIdParam);
  }, [
    activeRouteParam,
    activeRunIdParam,
    activeSavedRouteIdParam,
    openAsGenerated,
  ]);

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

  useEffect(() => {
    const sheet = bottomSheetRef.current;
    if (!sheet) return;
    if (sheetMode === 'generated') {
      sheet.snapToIndex(1);
      setSheetSnapIndex(1);
    } else if (sheetMode === 'active') {
      sheet.snapToIndex(0);
      setSheetSnapIndex(0);
      setShowActiveHud(true);
    } else if (sheetMode === 'request') {
      const targetIndex = isPlacementSheet ? 0 : 1;
      sheet.snapToIndex(targetIndex);
      setSheetSnapIndex(targetIndex);
    } else {
      sheet.snapToIndex(0);
      setSheetSnapIndex(0);
    }
  }, [sheetMode, isPlacementSheet]);

  /** Fixed bottom padding — must not change when the sheet snaps (avoids map zoom jump). */
  const mapBottomPadding = useMemo(() => {
    if (isPlacementSheet) {
      return placementCollapsed + sheetBottomInset;
    }
    if (sheetMode === 'request') {
      return requestExpandedHeight + sheetBottomInset;
    }
    if (sheetMode === 'generated') {
      return generatedExpandedHeight + sheetBottomInset;
    }
    return activeExpandedHeight + sheetBottomInset;
  }, [
    isPlacementSheet,
    sheetMode,
    placementCollapsed,
    requestExpandedHeight,
    generatedExpandedHeight,
    activeExpandedHeight,
    sheetBottomInset,
  ]);

  useEffect(() => {
    const sheet = bottomSheetRef.current;
    if (!sheet || sheetSnapIndex !== 1) return;
    sheet.snapToIndex(1);
  }, [requestExpandedHeight, generatedExpandedHeight, activeExpandedHeight]);

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
    if (sheetMode !== 'active') {
      setShowActiveHud(false);
    }
  }, [sheetMode]);

  const centerMapOnUser = (coord: Coordinate) => {
    if (userLocationCenteredRef.current || placementMode) return;
    const region: Region = {
      latitude: coord.latitude,
      longitude: coord.longitude,
      latitudeDelta: MAP_USER_LOCATION_DELTA,
      longitudeDelta: MAP_USER_LOCATION_DELTA,
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
    if (sheetMode === 'request' || showUserPosition) {
      centerMapOnUser(location);
    }
  }, [location, placementMode, sheetMode, showUserPosition]);

  const handleMapReady = () => {
    const pending = pendingUserCenterRef.current;
    if (pending && !userLocationCenteredRef.current && !placementMode) {
      if (sheetMode === 'request' || showUserPosition) {
        centerMapOnUser(pending);
      }
      return;
    }
    if (
      location &&
      !userLocationCenteredRef.current &&
      !placementMode &&
      (sheetMode === 'request' || showUserPosition)
    ) {
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
      mapCenterRef.current = existing;
      animateMapTo(existing);
    } else if (location) {
      mapCenterRef.current = location;
      animateMapTo(location);
    }
    setPlacementMode(mode);
  };

  const handleSelectStart = () => {
    beginPlacement('start', startPoint);
  };

  const handleSelectEnd = () => {
    beginPlacement('end', endPoint);
  };

  const handleConfirmPlacement = () => {
    if (!placementMode) return;
    const coord = mapCenterRef.current;
    if (placementMode === 'start') {
      setStartPoint(coord);
    } else if (placementMode === 'end') {
      setEndPoint(coord);
    }
    setPlacementMode(null);
  };

  const handleCancelPlacement = () => {
    setPlacementMode(null);
  };

  const handleGenerateRoute = async () => {
    if (isGeneratingRef.current || placementMode) return;
    isGeneratingRef.current = true;
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
      setShowUserPosition(false);
      setRunId(null);
      setSavedRouteId(null);

      try {
        let previousRoutesGenerated = 0;
        try {
          const priorStats = await getMyStats();
          previousRoutesGenerated = priorStats.routesGeneratedCount ?? 0;
        } catch {
          // Anta 0 om stats inte kan hämtas före increment.
        }

        const stats = await incrementGeneratedStats();
        const celebrated = await getCelebratedBadgeIds();
        let celebrationIds = getRouteGeneratedCelebrationBadgeIds(
          stats,
          celebrated,
          previousRoutesGenerated
        );
        if (celebrationIds.length === 0) {
          celebrationIds = getNewUnlockIds(stats, celebrated);
        }
        if (celebrationIds.length > 0) {
          setTimeout(() => showBadgeCelebration(celebrationIds), 400);
        }
      } catch (err) {
        console.warn(
          'Kunde inte uppdatera statistik eller badges på servern:',
          err
        );
      }
    } catch (error) {
      console.error('Kunde inte generera rutt:', error);
    } finally {
      isGeneratingRef.current = false;
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
    challengeTargetSeconds,
    challengeFromName,
    elapsedSeconds,
  });

  const handleFetchCheckpoint = async () => {
    if (!location || !generatedRoute) return;
    if (!canFetchCheckpoint) return;

    const checkpointIndex = generatedRoute.checkpoints.filter(
      (cp) => cp.completed
    ).length;

    const routeInstance = new Route(
      generatedRoute.id,
      generatedRoute.start,
      generatedRoute.distance,
      checkpointIndex
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
      const { movement } = getResults();
      if (runId) {
        try {
          await completeRun(runId, {
            durationSeconds: elapsedSeconds,
            checkpointsCompleted: checkpointDone,
            distanceMeters: Math.round(trackDistanceM),
            trackPoints: simplifyTrackPoints(movement),
            status: 'completed',
          });
        } catch (err) {
          console.warn('Kunde inte avsluta körning på servern:', err);
        }
      }

      let celebrationBadgeIds: string[] = [];
      try {
        let previousTotalMeters = 0;
        let previousTotalCheckpoints = 0;
        try {
          const priorStats = await getMyStats();
          previousTotalMeters = priorStats.totalDistanceMeters;
          previousTotalCheckpoints = priorStats.totalCheckpointsTaken;
        } catch {
          // Om stats inte kan hämtas antar vi 0 — celebration kan missas en gång.
        }

        const stats = await completeRunStats({
          generatedRouteDistanceMeters: Math.round(
            generatedRoute.distance * 1000
          ),
          actualRunDistanceMeters: Math.round(trackDistanceM),
          checkpointsTakenCount: checkpointDone,
        });
        const celebrated = await getCelebratedBadgeIds();
        celebrationBadgeIds = getRunCompletionCelebrationBadgeIds(
          stats,
          celebrated,
          generatedRoute.distance,
          previousTotalMeters,
          previousTotalCheckpoints
        );
      } catch (err) {
        console.warn('Kunde inte spara statistik på servern:', err);
      }

      stopTracking();
      resetActiveRun();
      navigation.navigate('RouteCompleted', {
        ...summary,
        celebrationBadgeIds,
      });
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

  const placementTapHint =
    placementMode === 'start'
      ? 'Flytta kartan så startpinnen hamnar rätt, tryck sedan Bekräfta'
      : 'Flytta kartan så slutpinnen hamnar rätt, tryck sedan Bekräfta';

  const sheetChromeStyles = styles.sheetChrome;

  const activeHudStyles = useMemo(
    () =>
      StyleSheet.create({
        pill: {
          position: 'absolute',
          top: activeHudTop,
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
        pillText: {
          fontSize: 13,
          color: '#1f2933',
          fontWeight: '600',
        },
        bottomActions: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: activeHudBottom,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        emergencyButton: {
          backgroundColor: '#7aa681',
          borderRadius: 18,
          height: 36,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        emergencyText: {
          color: '#fff',
          fontSize: 13,
          fontWeight: '700',
        },
        fetchButton: {
          height: 36,
          borderRadius: 14,
          backgroundColor: '#7aa681',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        },
        fetchButtonDisabled: {
          backgroundColor: '#a8aeb5',
        },
        fetchIcon: {
          marginRight: 6,
        },
        fetchText: {
          color: '#fff',
          fontSize: 13,
          fontWeight: '700',
          marginRight: 8,
        },
        fetchArrow: {
          color: '#fff',
          fontSize: 16,
          fontWeight: '900',
          marginTop: -1,
        },
      }),
    [activeHudTop, activeHudBottom]
  );

  const hudStatsTop =
    (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0) +
    activeHudStatsTop;

  const renderSheetHandle = useCallback(
    (props: ComponentProps<typeof BottomSheetHandle>) => (
      <BottomSheetHandle
        {...props}
        style={[
          props.style,
          sheetChromeStyles.handleArea,
          !canDragSheet && sheetChromeStyles.handleAreaCompact,
        ]}
        indicatorStyle={styles.sheetHandleIndicatorHidden}
      >
        <View style={sheetChromeStyles.handle} />
        {canDragSheet ? (
          <View style={sheetChromeStyles.handleSecondary} />
        ) : null}
        {sheetMode === 'active' && sheetSnapIndex === 0 ? (
          <Text style={sheetChromeStyles.handleHint}>
            Dra upp för mer information
          </Text>
        ) : null}
        {sheetMode === 'generated' && sheetSnapIndex === 0 ? (
          <Text style={sheetChromeStyles.handleHint}>
            Dra upp för att se rutt och starta
          </Text>
        ) : null}
      </BottomSheetHandle>
    ),
    [canDragSheet, sheetMode, sheetSnapIndex, sheetChromeStyles]
  );

  const initialSheetIndex = isPlacementSheet
    ? 0
    : sheetMode === 'generated' || sheetMode === 'request'
      ? 1
      : 0;

  return (
    <View style={styles.container}>
      {/* Karta i bakgrunden */}
      <View style={styles.mapBackdrop} pointerEvents="box-none">
        <NativeViewGestureHandler ref={mapGestureRef}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            customMapStyle={CustomMapStyle}
            showsBuildings={false}
            showsCompass={false}
            showsUserLocation={showsUserLocationOnMap}
            scrollEnabled
            zoomEnabled
            zoomTapEnabled
            rotateEnabled
            pitchEnabled={false}
            mapPadding={mapPadding}
            onMapReady={handleMapReady}
            initialRegion={
              mapInitialRegion ?? {
                latitude: 59.334591,
                longitude: 18.06324,
                latitudeDelta: MAP_USER_LOCATION_DELTA,
                longitudeDelta: MAP_USER_LOCATION_DELTA,
              }
            }
            onRegionChangeComplete={(region) => {
              mapDeltaRef.current = {
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
              };
              mapCenterRef.current = {
                latitude: region.latitude,
                longitude: region.longitude,
              };
            }}
          >
            <UrlTile
              urlTemplate={'http://79.76.60.222:3000/tiles/{z}/{x}/{y}.png'}
              maximumZ={20}
              minimumZ={12}
              shouldReplaceMapContent={false}
              tileSize={512}
              zIndex={1}
            />

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
          </MapView>
        </NativeViewGestureHandler>
        {placementMode ? (
          <PlacementTapHint
            label={placementTapHint}
            variant={placementMode}
            bottomInset={mapBottomPadding}
          />
        ) : null}
      </View>

      <Pressable
        style={styles.legendButton}
        onPress={() => setLegendOpen(true)}
        accessibilityLabel="Visa karttecken"
        hitSlop={8}
      >
        <Text style={styles.legendButtonText}>?</Text>
      </Pressable>

      <MapLegendModal visible={legendOpen} onClose={() => setLegendOpen(false)} />

      {sheetMode === 'active' && generatedRoute && showActiveHud && (
        <>
          <ActiveRouteStatsBar
            variant="hud"
            stats={activeStats}
            hudTop={hudStatsTop}
          />
          <View style={activeHudStyles.pill}>
            <View style={styles.activeHudArrowWrap}>
              <View style={styles.activeHudArrowLine} />
              <View style={styles.activeHudArrowHeadLeft} />
              <View style={styles.activeHudArrowHeadRight} />
            </View>
            <Text style={activeHudStyles.pillText}>
              {activeStats.distanceToNextM} m till nästa checkpoint
            </Text>
          </View>
          <View style={activeHudStyles.bottomActions}>
            <Pressable
              style={[
                activeHudStyles.fetchButton,
                !canFetchCheckpoint && activeHudStyles.fetchButtonDisabled,
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
                style={activeHudStyles.fetchIcon}
              />
              <Text style={activeHudStyles.fetchText}>Hämta checkpoint</Text>
              <Text style={activeHudStyles.fetchArrow}>›</Text>
            </Pressable>
            <Pressable
              style={activeHudStyles.emergencyButton}
              onPress={toggleUserPosition}
            >
              <Text style={activeHudStyles.emergencyText}>
                {showUserPosition ? 'Dölj position' : 'Visa position'}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <View
        style={styles.bottomNavLayer}
        pointerEvents="box-none"
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          if (height > 0) {
            setMeasuredBottomNavHeight(height);
          }
        }}
      >
        <BottomNav
          navigation={navigation}
          activeTab="CreateRoute"
          fromOrigin={from}
        />
      </View>

      <BottomSheet
        key={`${sheetMode}-${placementMode ?? 'none'}`}
        ref={bottomSheetRef}
        index={initialSheetIndex}
        snapPoints={snapPoints}
        bottomInset={bottomSheetInset}
        onChange={handleSheetChange}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        enableHandlePanningGesture={canDragSheet}
        enableContentPanningGesture={canDragSheetContent}
        waitFor={mapGestureRef}
        simultaneousHandlers={mapGestureRef}
        activeOffsetY={[-20, 20]}
        failOffsetX={[-15, 15]}
        containerStyle={styles.sheetContainer}
        handleComponent={renderSheetHandle}
        handleStyle={styles.sheetHandleContainer}
        backgroundStyle={[
          styles.sheetBackground,
          isPlacementSheet && styles.filterSheetPlacement,
        ]}
      >
        <BottomSheetView style={sheetChromeStyles.content}>
          {sheetMode === 'request' ? (
            <View style={sheetChromeStyles.bodyWrap}>
              <RouteRequestSheet
                greetingFirstName={greetingFirstName}
                onGreetingLayout={setRequestGreetingHeight}
                onContentLayout={setRequestContentHeight}
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
              />
            </View>
          ) : sheetMode === 'generated' && generatedRoute ? (
            <View
              style={sheetChromeStyles.bodyWrap}
              onLayout={(event) => {
                if (sheetSnapIndex === 0) return;
                const height = event.nativeEvent.layout.height;
                if (height > 0) setGeneratedBodyHeight(height);
              }}
            >
              {sheetSnapIndex > 0 ? (
                <>
                  {challengeFromName != null ||
                  challengeTargetSeconds != null ? (
                    <View style={styles.challengeBanner}>
                      <Text style={styles.challengeBannerTitle}>
                        Utmaning
                        {challengeFromName ? ` från ${challengeFromName}` : ''}
                      </Text>
                      <Text style={styles.challengeBannerSub}>
                        {challengeTargetSeconds != null &&
                        challengeTargetSeconds > 0
                          ? `Tid att slå: ${formatDurationClock(challengeTargetSeconds)}`
                          : 'Kör samma planerade rutt som utmanaren'}
                      </Text>
                      <Text style={styles.challengeBannerHint}>
                        Rutten visas på kartan med checkpoints — som när du
                        skapar en rutt.
                      </Text>
                    </View>
                  ) : null}
                  <RouteGeneratedSheet
                    route={generatedRoute}
                    onGenerateNew={handleGenerateRoute}
                    onStartOrienteering={handleStartOrienteering}
                    showUserPosition={showUserPosition}
                    onToggleUserPosition={toggleUserPosition}
                    isGenerating={isGenerating}
                    onBackToRequest={() => {
                      if (openAsGenerated) {
                        navigation.goBack();
                        return;
                      }
                      setSheetMode('request');
                      setShowUserPosition(true);
                    }}
                  />
                </>
              ) : null}
            </View>
          ) : sheetMode === 'active' && generatedRoute ? (
            <View
              style={sheetChromeStyles.bodyWrap}
              onLayout={(event) => {
                if (sheetSnapIndex === 0) return;
                const height = event.nativeEvent.layout.height;
                if (height > 0) setActiveBodyHeight(height);
              }}
            >
              {sheetSnapIndex > 0 ? (
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
                      runId: runId ?? undefined,
                      elapsedSeconds,
                      distanceMeters: Math.round(trackDistanceM),
                    });
                  }}
                  onEmergency={toggleUserPosition}
                  showUserPosition={showUserPosition}
                  onFetchCheckpoint={handleFetchCheckpoint}
                  canFetchCheckpoint={canFetchCheckpoint}
                />
              ) : null}
            </View>
          ) : null}
        </BottomSheetView>
      </BottomSheet>

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
  bottomNavLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    elevation: 5,
  },
  sheetContainer: {
    zIndex: 20,
    elevation: 20,
  },
  sheetHandleIndicatorHidden: {
    display: 'none',
  },
  sheetHandleContainer: {
    backgroundColor: 'transparent',
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e8eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  filterSheetPlacement: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  sheetChrome: {
    content: {
      paddingHorizontal: 18,
      paddingTop: 2,
      paddingBottom: 0,
    },
    bodyWrap: {
      paddingBottom: SHEET_BODY_BOTTOM_PADDING,
    },
    handleArea: {
      alignItems: 'center',
      paddingTop: 9,
      paddingBottom: 10,
      backgroundColor: 'transparent',
    },
    handleAreaCompact: {
      paddingBottom: 6,
    },
    handle: {
      width: 22,
      height: 3,
      borderRadius: 2,
      backgroundColor: '#222',
    },
    handleSecondary: {
      width: 22,
      height: 3,
      borderRadius: 2,
      backgroundColor: '#222',
      marginTop: 3,
    },
    handleHint: {
      marginTop: 6,
      fontSize: 11,
      color: '#9ca3af',
      fontWeight: '500',
      letterSpacing: 0.2,
    },
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
  challengeBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(62, 122, 68, 0.12)',
  },
  challengeBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  challengeBannerSub: {
    fontSize: 14,
    color: '#3E7A44',
    fontWeight: '600',
  },
  challengeBannerHint: {
    fontSize: 13,
    color: '#5c636a',
    marginTop: 6,
    lineHeight: 18,
  },
  legendButton: {
    position: 'absolute',
    top: 56,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  legendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E7A44',
  },
});
