import { useState, useEffect } from 'react';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const SIMULATED_PATH: Coordinate[] = [
  { latitude: 59.382334, longitude: 17.96855 },
  { latitude: 59.384281, longitude: 17.970023 },
  { latitude: 59.385323, longitude: 17.969393 },
  { latitude: 59.387078, longitude: 17.971279 },
  { latitude: 59.389755, longitude: 17.97146 },
  { latitude: 59.392072, longitude: 17.969921 },
];

export function useSimuladtedLocation(intervalMs: number = 2000) {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setLocation(SIMULATED_PATH[i] ?? null);
      setIndex(i);

      i += 1;
      if (i >= SIMULATED_PATH.length) {
        clearInterval(timer);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return { location };
}

// Typo-safe alias (the original export name is kept for backwards compatibility).
export const useSimulatedLocation = useSimuladtedLocation;
