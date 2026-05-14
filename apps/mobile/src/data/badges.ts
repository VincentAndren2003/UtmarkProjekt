/* eslint-disable @typescript-eslint/no-require-imports -- lokala badge-tillgångar */
import { ImageSourcePropType } from 'react-native';

// Katalog över alla badges. Lägg till en ny badge genom att utöka listan
// här, så dyker den upp både på profilsidan och i BadgesScreen automatiskt.
//
// `unlocked` i listan nedan är bara default — använd `getBadgesForUser()` i UI
// med id:n från backend så att bara verkligt upplåsta badges visas som aktiva.
export type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  // TODO: Lägg till bild när vi har grafik för respektive badge.
  // Lokal: image: require('../assets/badges/skogsvandrare.png')
  // Remote: image: { uri: 'https://...' }
  image?: ImageSourcePropType;
};

export const BADGES: Badge[] = [
  {
    id: 'ny-utforskare',
    name: 'Ny utforskare',
    description: 'Avklara din första rutt.',
    unlocked: false,
    image: require('../../assets/Badges/ny-utforskare.png'),
  },
  {
    id: 'skogsvandrare',
    name: 'Skogsvandrare',
    description: 'Avklara 10 rutter i skog och mark.',
    unlocked: false,
    image: require('../../assets/Badges/skogsvandrare.png'),
  },
  {
    id: 'terrangmastare',
    name: 'Terrängmästare',
    description: 'Avklara 25 rutter i naturreservat.',
    unlocked: false,
    image: require('../../assets/Badges/terrangmastare.png'),
  },
  {
    id: 'morgonpigg',
    name: 'Morgonpigg',
    description: 'Avklara en rutt innan kl 07:00.',
    unlocked: false,
    image: require('../../assets/Badges/Morgonpigg.png'),
  },
  {
    id: 'nattuggla',
    name: 'Nattuggla',
    description: 'Slutför en rutt efter kl 20:00.',
    unlocked: false,
    image: require('../../assets/Badges/Nattuggla.png'),
  },
  {
    id: 'aventyrare',
    name: 'Äventyrare',
    description: 'Genomför 10 rutter.',
    unlocked: false,
    image: require('../../assets/Badges/aventyrare.png'),
  },
  {
    id: 'skogsmastare',
    name: 'Skogsmästare',
    description: 'Genomför 25 rutter.',
    unlocked: false,
    image: require('../../assets/Badges/skogsmastare.png'),
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Genomför 100 rutter.',
    unlocked: false,
    image: require('../../assets/Badges/Legend.png'),
  },
  {
    id: 'milen',
    name: 'Milen',
    description: 'Utför en rutt på 1 mil.',
    unlocked: false,
    image: require('../../assets/Badges/milen.png'),
  },
  {
    id: 'halvmaran',
    name: 'Halvmaran',
    description: 'Utför en rutt på 2 mil.',
    unlocked: false,
    image: require('../../assets/Badges/halvmaran.png'),
  },
  {
    id: 'hundra-km',
    name: '100',
    description: 'Gå totalt 100 km.',
    unlocked: false,
    image: require('../../assets/Badges/100.png'),
  },
  {
    id: 'tusenkilometaren',
    name: 'Tusenkilometaren',
    description: 'Gå totalt 1000 km.',
    unlocked: false,
    image: require('../../assets/Badges/Tusenkilometaren.png'),
  },
  {
    id: 'tre-i-rad',
    name: 'Tre i rad',
    description: 'Gå tre dagar i följd.',
    unlocked: false,
    image: require('../../assets/Badges/tre-i-rad.png'),
  },
  {
    id: 'utmanaren',
    name: 'Utmanaren',
    description: 'Utmana en vän på en rutt.',
    unlocked: false,
    image: require('../../assets/Badges/utmanaren.png'),
  },
  {
    id: 'vinnaren',
    name: 'Vinnaren',
    description: 'Slå en väns tid på samma rutt.',
    unlocked: false,
    image: require('../../assets/Badges/vinnaren.png'),
  },
  {
    id: 'hundra-kontroller',
    name: 'Hundra kontroller',
    description: 'Ta totalt 100 checkpoints.',
    unlocked: false,
    image: require('../../assets/Badges/Hundra kontroller.png'),
  },
];

/** Bygg badge-lista för inloggad användare. `unlockedIds` från t.ex. GET /users/me/badges. */
export function getBadgesForUser(
  unlockedIds: ReadonlySet<string> | readonly string[] = []
): Badge[] {
  const set = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds);
  return BADGES.map((b) => ({ ...b, unlocked: set.has(b.id) }));
}
