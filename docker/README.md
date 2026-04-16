# Docker Setup Instruktioner

För Windows: Installera Docker Desktop och WSL2

För Mac: Installera bara Docker Desktop

För Linux: Installera Docker Engine (kan också installera
Docker Desktop om man vill.)

Länk: https://www.docker.com/products/docker-desktop/

### För Windows

Gå in i Windows Powershell och skriv kommandot `wsl --install`, och vänta på att installationen blir klar.

För att gå ut ur WSL skriver man "exit" och för att starta WSL i Powershell igen så skriver man bara "WSL". Man vet att det funkar när man ser att texten som visar vart man är har ändrat färg.

### För Linux

Följ dessa instruktioner: https://docs.docker.com/engine/install/fedora/

---

## Navigera

Öppna en terminal och klona repot till en mapp där du vill ha projektet.
`git clone https://github.com/VincentAndren2003/UtmarkProjekt.git`

Navigera sedan till den klonade mappen och in i `docker` mappen (där `docker-compose.yml` ligger).

`cd UtmarkProjekt/docker`

Alternativt kan man öppna en terminal i `docker` mappen genom utforskaren på Windows.

---

## Förberedande av server

Innan du bygger miljön behöver du skapa en `.env` fil i **`docker/`** mappen. Det finns en mall: `.env.example`.

I terminalen (inne i `docker/`) kan du skriva `cp .env.example .env` och redigera vid behov. Filen styr databasens namn, användare och lösenord för Docker Compose.

Om man vill byta lösenord till sin databas så kan man redigera .env filen. Annars är databas lösenordet "hemligt".

---

## Bygga miljön

När du är i mappen `docker`, skriv följande kommando:
`docker compose up -d --build`

Detta kommer att bygga och slänga upp en lokal server. Testa sedan så att allt fungerar genom följande kommandon:
`docker compose exec app /bin/bash`

---

## Testa så att container fungerar

Efter detta bör du se att du är inne i något i stilen av `5fe8f4d1b1c0:/app#`, behöver inte var exakt matchning. Detta betyder att du är inne i containern.

Kör sedan följande kommandon för att se att du får någon output av att köra dem.

```node --version
tsc --version
ts-node --version
```

Mobilappen körs med **Expo** på din dator (se repo-roten `README.md` och `apps/mobile/README.md`), inte via `ts-node` i containern.

Efter att du har bekräftat att alla kommandon fungerar kan du skriva, `exit`, för att gå ur containern.

---

## Testa logga in på databas

Nu kan du testa att logga in på http://localhost:5050 i din browser. Användar namn bör vara "admin@admin.com" och lösen ord bör vara "admin. Om du inte får upp en hemsida så kan det vara så att servern inte är helt uppe ännu, ge den några min för att starta och testa igen.

Här inne bör du se en flik uppe till vänster som heter "Servers" tryck på pilen brevid den och skriv sedan in lösenordet som du skrev i .env filen (eller "hemligt" om du inte gjorde några ändringar).

Efter det bör du se en flik som heter "utmarkDatabas", om du kan se den så är setup av utvecklings miljön klar.

---

## Klar

Sedan när du är klar kan du skriva `docker compose down` för att stänga alla containers och då avsluta de lokal hostade servrarna.

Alternativt stoppa genom Docker Desktop vyn. Gå in på "container" fliken och sedan tryck på "Stop" till höger på den aktiva containern.

---
