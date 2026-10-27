# MathLab

MathLab je jednoduchá česká aplikace na procvičování malé násobilky. V každém kole nabídne pět příkladů na násobení a pět na dělení. Funguje také offline po prvním načtení.

## Technologie

Vite, čistý JavaScript, HTML, CSS a `vite-plugin-pwa`. Aplikace nepoužívá framework, backend, databázi ani externí služby.

## Lokální spuštění

```sh
npm install
npm run dev
```

Automatické testy spustíte příkazem `npm test`. Produkční sestavení vytvoříte příkazem `npm run build` a lokálně zobrazíte příkazem `npm run preview`.

## Nasazení na Vercel

Importujte projekt do Vercel jako statický Vite projekt. Build příkaz nastavte na `npm run build` a výstupní adresář na `dist`. Vercel pro běžné nasazení automaticky poskytuje HTTPS; instalovatelná PWA vyžaduje HTTPS (výjimkou je localhost).

## Přidání na plochu iPhonu

Otevřete nasazenou aplikaci v Safari, klepněte na **Sdílet** a zvolte **Přidat na plochu**. Aplikaci pak spustíte samostatně z její ikony. Offline provoz je dostupný po prvním načtení aplikace.

## Instalace na Androidu

Otevřete nasazenou aplikaci v podporovaném prohlížeči, například Chrome, a použijte jeho nabídku **Instalovat aplikaci** nebo **Přidat na plochu**. Po instalaci se MathLab spouští samostatně a po prvním načtení funguje i offline.
