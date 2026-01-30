# Avanza Courtage Optimizer

**Ett Chrome-tillägg som automatiskt byter till den billigaste courtageklassen på Avanza.**

## ⚠️ DISCLAIMER (Ansvarsfriskrivning)

**Viktigt:** Du använder tillägget **helt på egen risk**.

- **Jag tar inget som helst ansvar** för att pluginet fungerar som det ska.
- Jag ansvarar inte för eventuella felaktiga orders, missade courtage-byten eller andra ekonomiska förluster.
- Det finns inga garantier. Dubbelkolla alltid dina orders innan du skickar iväg dem.
- Observera: Användning av detta tillägg kan strida mot Avanzas användarvillkor och API-regler. Kontrollera deras villkor själv innan användning.

## Funktioner

- **Automatisk uträkning**: Räknar ut optimal klass baserat på belopp.
- **Automatisk switch**: Byter klass med ett knapptryck (i bakgrunden) utan att ladda om sidan.
- **Spara pengar**: Säkerställer att du aldrig betalar mer courtage än nödvändigt.
- **Säkert**: All kod körs lokalt i din webbläsare. Ingen data skickas externt.
- **Private Banking Support**: Stöd för PB Mini, PB och PB Fast Pris.

## Installation (Manuell / Utvecklarläge)

Eftersom detta är ett hobbyprojekt som interagerar med bankfunktioner finns det inte på Chrome Web Store. Du installerar det enkelt själv:

1.  **Ladda ner koden**: Klicka på `Code` -> `Download ZIP` här på GitHub (eller klona repot).
2.  **Packa upp**: Om du laddade ner zip-filen, packa upp den till en mapp.
3.  **Öppna Chrome Tillägg**: Gå till `chrome://extensions` i Chrome.
4.  **Aktivera Utvecklarläge**: Slå på "Developer mode" uppe till höger.
5.  **Ladda tillägget**: Klicka på "Load unpacked" (Läs in okomprimerat) och välj mappen.

## Hur funkar det?

Tillägget lyssnar på nätverkstrafiken när Avanza räknar ut det preliminära courtaget (`preliminary-fee`).

1.  När du skriver in Antal/Pris, skickar Avanza en förfrågan.
2.  Tillägget fångar den, räknar ut totalbeloppet och kollar mot Avanzas prislista.
3.  Om din nuvarande klass är fel, skickar tillägget ett "byt klass"-kommando till Avanza med samma säkerhetsnycklar som din inloggade session har.

## Bidra?

Hittar du en bugg? Skapa en Issue eller en Pull Request!
