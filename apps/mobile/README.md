# Mobile app (Expo + React Native + TypeScript)

## Run locally

From this folder:

```bash
npm install
npm start
```

Then:

- Press `i` for iOS Simulator (macOS + Xcode)
- Press `a` for Android emulator
- Scan the QR code with **Expo Go** on a physical device (same Wi‑Fi)

## Project layout

- `App.tsx` — root component (registered by `index.ts`)
- `src/screens/` — full screens
- `src/components/` — reusable UI
- `src/navigation/` — navigation setup (add React Navigation when ready)
- `src/services/` — API / Supabase clients
- `src/hooks/` — reusable hooks
- `src/utils/` — helpers
- `src/types/` — mobile-only types
- `assets/` — icons and splash images (Expo)

## Notes

- Use `npx expo start` (Expo CLI comes from the `expo` package in this project).
- If you see errors about legacy global `expo-cli`, uninstall it: `npm uninstall -g expo-cli`
