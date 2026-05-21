import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { BadgeUnlockedModal } from '../components/BadgeUnlockedModal';
import type { Badge } from '../data/badges';
import { getBadgesFromIds } from '../services/badgeUnlock';
import { markBadgesCelebrated } from '../services/celebratedBadgesStorage';

type BadgeCelebrationContextValue = {
  showBadgeCelebration: (badgeIds: string[]) => void;
};

const BadgeCelebrationContext =
  createContext<BadgeCelebrationContextValue | null>(null);

export function BadgeCelebrationProvider({
  children,
  onViewAllBadges,
}: {
  children: ReactNode;
  onViewAllBadges: () => void;
}) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const pendingIdsRef = useRef<string[]>([]);

  const dismiss = useCallback(() => {
    const ids = pendingIdsRef.current;
    if (ids.length > 0) {
      void markBadgesCelebrated(ids);
      pendingIdsRef.current = [];
    }
    setBadges([]);
  }, []);

  const showBadgeCelebration = useCallback((badgeIds: string[]) => {
    const resolved = getBadgesFromIds(badgeIds);
    if (resolved.length === 0) {
      console.warn('[Badge] Ingen popup — okända badge-id:', badgeIds);
      return;
    }
    pendingIdsRef.current = badgeIds;
    setBadges(resolved);
  }, []);

  const value = useMemo(
    () => ({ showBadgeCelebration }),
    [showBadgeCelebration]
  );

  return (
    <BadgeCelebrationContext.Provider value={value}>
      {children}
      <BadgeUnlockedModal
        badges={badges}
        visible={badges.length > 0}
        onClose={dismiss}
        onViewAll={() => {
          dismiss();
          onViewAllBadges();
        }}
      />
    </BadgeCelebrationContext.Provider>
  );
}

export function useBadgeCelebration(): BadgeCelebrationContextValue {
  const ctx = useContext(BadgeCelebrationContext);
  if (!ctx) {
    throw new Error(
      'useBadgeCelebration must be used within BadgeCelebrationProvider'
    );
  }
  return ctx;
}
