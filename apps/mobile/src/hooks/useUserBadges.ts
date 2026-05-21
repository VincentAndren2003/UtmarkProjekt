import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getBadgesForUser, type Badge } from '../data/badges';
import { getMyStats } from '../lib/api';
import { getUnlockedBadgeIds } from '../services/badgeUnlock';

export function useUserBadges() {
  const [badges, setBadges] = useState<Badge[]>(() => getBadgesForUser());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await getMyStats();
      setBadges(getBadgesForUser(getUnlockedBadgeIds(stats)));
    } catch {
      setBadges(getBadgesForUser());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { badges, loading, reload: load };
}
