# Docker Setup Instruktioner
För Windows och Mac: Installera Docker Desktop 
För Linux: Installera Docker Engine (kan också installera 
Docker Desktop om man vill.)

Länk: https://www.docker.com/products/docker-desktop/

### För Linux
Följ dessa instruktioner: https://docs.docker.com/engine/install/fedora/

---

## Navigera
Öppna en terminal och klona repot till en mapp där du vill ha projektet.
`git clone https://github.com/VincentAndren2003/UtmarkProjekt.git`

Navigera sedan till den klonade mappen och in i "app" mappen.

`cd utmarkprojekt/app/`

Alternativt kan man öppna en terminalen i "app" mappen genom, till exempel, utforskaren på Windows.

---

## Förberedande av server
Innan du bygger miljön behöver du skapa en .env fil, det finns redan en template för vad som behöver finnas. 

I terminalen kan du skriva `cp .env.example .env` för att kopiera innehållet och lägga det i en .env fil. Filen bestämmer saker angående databas servern. 

Om man vill byta lösenord till sin databas så kan man redigera .env filen. Annars är databas lösenordet "hemligt".

---

## Bygga miljön
När du är i mappen "app", skriv följande kommando:
`docker compose up --build`

Detta kommer att bygga och slänga upp en lokal server. Testa sedan så att allt fungerar genom följande kommandon:
`docker compose exec app /bin/bash`

---

## Testa så att container fungerar
Efter detta bör du se att du är inne i något i stilen av `5fe8f4d1b1c0:/app#`, behöver inte var exakt matchning. Detta betyder att du är inne i containern.

Kör sedan följande kommandon för att se att du får någon output av att köra dem.

```node --version
tsc --version
ts-node --version
ts-node src/index.ts
```

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