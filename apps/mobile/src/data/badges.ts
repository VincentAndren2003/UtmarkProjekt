import { ImageSourcePropType } from 'react-native';

// Katalog över alla badges. Lägg till en ny badge genom att utöka listan
// här, så dyker den upp både på profilsidan och i BadgesScreen automatiskt.
//
// `unlocked` styr om badgen är upplåst för användaren. När den är true
// och `image` är satt visas bilden; annars visas en låst (grå) cirkel.
// Just nu är alla låsta — på sikt sätts `unlocked` utifrån användarens
// statistik / backend-data.
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
  },
  {
    id: 'skogsvandrare',
    name: 'Skogsvandrare',
    description: 'Avklara 10 rutter i skog och mark.',
    unlocked: false,
  },
  {
    id: 'terrangmastare',
    name: 'Terrängmästare',
    description: 'Avklara 25 rutter i naturreservat.',
    unlocked: false,
  },
  {
    id: 'morgonpigg',
    name: 'Morgonpigg',
    description: 'Avklara en rutt innan kl 07:00.',
    unlocked: false,
  },
];
