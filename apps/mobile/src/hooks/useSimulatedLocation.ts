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
    const timer = setInterval(() => {
      setLocation(SIMULATED_PATH[index]);
      setIndex((prev) => {
        if (prev >= SIMULATED_PATH.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [index]);
  return { location };
}
