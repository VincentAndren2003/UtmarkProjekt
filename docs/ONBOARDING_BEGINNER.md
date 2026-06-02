# Kör Utmark lokalt — steg för steg (nybörjarvänligt)

Det här är en **praktisk lokal-körningsguide**. För snabbtest mot vår VM: se `README.md`.

---

## 0) Mental modell (vad som körs)

När du kör allt lokalt kör du:

- **MongoDB** (databasen)
- **API Gateway** (`apps/api`, port **3000**) — publikt API som mobilappen pratar med
- **Microservices** (körs internt):
  - `apps/auth-service` (3001)
  - `apps/profile-service` (3002)
  - `apps/routes-service` (3003)
  - `apps/friend-service` (3004)
- **Mobilapp** (`apps/mobile`) via Expo

---

## 1) Installera verktyg (en gång)

- **Node.js (LTS)** + npm
- **MongoDB Community** + `mongosh`
- **Expo Go** på telefonen (för att testa snabbt på en riktig enhet)

Verifiera:

```bash
node -v
npm -v
mongosh --version
```

---

## 2) Installera dependencies (en gång)

Kör från repo-roten:

```bash
npm ci
npm ci --prefix apps/mobile
npm ci --prefix apps/api
npm ci --prefix apps/auth-service
npm ci --prefix apps/profile-service
npm ci --prefix apps/routes-service
npm ci --prefix apps/friend-service
```

---

## 3) Skapa `.env`-filer (om de saknas)

> Vid zip-inlämning brukar `.env` redan följa med. Hoppa över detta om filerna finns.

```bash
cp apps/api/.env.example             apps/api/.env
cp apps/mobile/.env.example          apps/mobile/.env
cp apps/auth-service/.env.example    apps/auth-service/.env
cp apps/profile-service/.env.example apps/profile-service/.env
cp apps/friend-service/.env.example  apps/friend-service/.env
```

### routes-service (saknar `.env.example`)

Skapa `apps/routes-service/.env` och sätt minst:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/utmarkprojekt
PORT=3003
```

### Mobilen ska peka på din lokala gateway

I `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 4) Starta MongoDB

macOS (Homebrew):

```bash
brew services start mongodb-community
```

Verifiera att den svarar:

```bash
mongosh mongodb://127.0.0.1:27017 --eval "db.runCommand({ ping: 1 })"
```

---

## 5) Starta backend (5 terminaler)

Starta varje service i en egen terminal:

```bash
cd apps/auth-service && npm run dev
```

```bash
cd apps/profile-service && npm run dev
```

```bash
cd apps/routes-service && npm run dev
```

```bash
cd apps/friend-service && npm run dev
```

```bash
cd apps/api && npm run dev
```

Verifiera gatewayen:

```bash
curl http://localhost:3000/api/health
```

Du ska få `{ "status": "ok" }`.

---

## 6) Starta mobilappen

I en ny terminal:

```bash
cd apps/mobile
npm run start
```

Skanna QR-koden med **Expo Go** (eller använd simulator om du har en).

---

## 7) Vanliga fel (snabb felsökning)

- **Port upptagen** (t.ex. 3000):
  - Stäng processen som kör, eller byt port i `.env`.
- **Mobilen funkar inte mot `localhost` på telefon**:
  - På en riktig telefon betyder `localhost` “telefonen själv”.
  - Lösning: sätt `EXPO_PUBLIC_API_URL` till din dators IP på samma Wi‑Fi, t.ex. `http://192.168.1.50:3000`.
- **MongoDB inte igång**:
  - Testa `mongosh`-kommandot i steg 4 igen.

