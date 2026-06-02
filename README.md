# Utmark

Utmark är en mobilapp som gör det lättare att komma ut i naturen: appen **genererar orienteringsliknande rutter** i grönområden, låter användaren **hitta checkpoints med GPS**, sparar historik, låser upp **badges** och låter en **utmana vänner**.

Det här är ett **monorepo** med en **API Gateway** och fyra microservices (Node/Express + MongoDB/Mongoose) samt en **Expo/React Native**-app.

---

## Till Edwin — så testar du projektet

Backend körs redan på vår **VM**, så du behöver i princip bara starta **mobilappen**. Eftersom `.env`-filerna följer med i zip-filen är allt redan konfigurerat.

### Snabbtest (rekommenderas)

```bash
cd apps/mobile
npm ci
npm run start
```

Skanna QR-koden med **Expo Go** på din telefon (eller tryck `i`/`a` för simulator). Appen pratar automatiskt med vår backend på VM.

**Vill du dubbelkolla att backend är uppe?** Kör:

```bash
curl http://79.76.60.222:3000/api/health
```

Du ska få svaret `{ "status": "ok" }`.

> `apps/mobile/.env` är redan satt till `EXPO_PUBLIC_API_URL=http://79.76.60.222:3000`. Om filen saknas eller VM inte svarar — se **"Kör allt lokalt"** längst ner.

---

## Arkitektur i korthet

- **Mobilen** pratar bara med **API Gateway** (`apps/api`, port **3000**).
- Gatewayen **verifierar JWT** för skyddade endpoints och **proxar** vidare till rätt service.
- Interna services litar på headern `x-user-id` från gateway och körs internt (t.ex. `127.0.0.1` på VM).
- **Ruttgenerering** och **Overpass API**-anrop (grönområden) körs i gateway.
- Alla services delar **samma MongoDB** (olika collections).

**Flöde (i text):**

- Mobilapp → API Gateway (3000)
- API Gateway → auth-service (3001) vid login/signup
- API Gateway → profile/routes/friend (3002–3004) för skyddade endpoints (med `x-user-id`)
- Services → MongoDB (Mongoose)
- API Gateway → Overpass API (för grönområden) och tiles-servern på VM (`/tiles/*`)

### Appar & portar

| Del | Sökväg | Port | Ansvar |
|-----|--------|------|--------|
| Mobilapp | `apps/mobile` | (Expo) | UI, karta, GPS, badges, vänner/utmaningar |
| API Gateway | `apps/api` | 3000 | Public API, JWT, proxy, ruttgenerering, tiles |
| auth-service | `apps/auth-service` | 3001 | signup/login, bcrypt, JWT-utfärdande |
| profile-service | `apps/profile-service` | 3002 | profil + stats (badges) |
| routes-service | `apps/routes-service` | 3003 | sparade rutter, runs, challenges |
| friend-service | `apps/friend-service` | 3004 | vänförfrågningar, vänlista, sök |

---

## Var ligger logiken?

- **Ruttgenerering + Overpass**: `apps/api/src/controllers/routeController.ts`, `apps/api/src/models/Route.ts`, `apps/api/src/services/GreenAreaService.ts`
- **Auth**: `apps/auth-service/src/controllers/authController.ts`
- **Profil & stats**: `apps/profile-service/src/controllers/`
- **Runs, sparade rutter, challenges**: `apps/routes-service/src/services/RoutesService.ts`
- **Vänner**: `apps/friend-service/src/controllers/friendsController.ts`

---

## Tester & kvalitet

Kör enhetstester (Vitest) och lint från repo-roten:

```bash
npm test
npm run lint
```

GitHub Actions kör lint + test automatiskt på varje PR/push mot `main`.

---

## Mer dokumentation

- **Teknisk genomgång (djup)**: [`docs/HOW_IT_WORKS.md`](./docs/HOW_IT_WORKS.md)
- **Kör lokalt (steg-för-steg)**: [`docs/ONBOARDING_BEGINNER.md`](./docs/ONBOARDING_BEGINNER.md)

---

## Kör allt lokalt (om VM inte fungerar)

Behövs bara om VM är nere eller om du vill köra hela stacken själv. Kräver **Node.js (LTS)** och **MongoDB** lokalt.

**1) Installera dependencies (från repo-roten):**

```bash
npm ci
npm ci --prefix apps/mobile
npm ci --prefix apps/api
npm ci --prefix apps/auth-service
npm ci --prefix apps/profile-service
npm ci --prefix apps/routes-service
npm ci --prefix apps/friend-service
```

**2) Skapa env-filer** (om de inte redan följde med i zip-filen):

```bash
cp apps/api/.env.example            apps/api/.env
cp apps/mobile/.env.example         apps/mobile/.env
cp apps/auth-service/.env.example   apps/auth-service/.env
cp apps/profile-service/.env.example apps/profile-service/.env
cp apps/friend-service/.env.example apps/friend-service/.env
```

I `apps/mobile/.env`, peka mot din lokala gateway:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> `apps/routes-service` saknar `.env.example`. Skapa `apps/routes-service/.env` med minst `MONGODB_URI` (och ev. `PORT=3003`).

**3) Starta MongoDB** (exempel macOS):

```bash
brew services start mongodb-community
```

**4) Starta backend (en terminal per service):**

```bash
cd apps/auth-service    && npm run dev   # :3001
cd apps/profile-service && npm run dev   # :3002
cd apps/routes-service  && npm run dev   # :3003
cd apps/friend-service  && npm run dev   # :3004
cd apps/api             && npm run dev   # :3000
```

**5) Starta mobilappen (ny terminal):**

```bash
cd apps/mobile && npm run start
```

**6) Verifiera att gatewayen svarar:**

```bash
curl http://localhost:3000/api/health
```
