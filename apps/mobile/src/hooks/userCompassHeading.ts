import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

export function useCompassHeading() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = angle >= 0 ? angle : angle + 360;
      setHeading(Math.round(angle));
    });
    return () => sub.remove();
  }, []);

  return heading;
}
