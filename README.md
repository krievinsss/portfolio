# Toms Ričards Krieviņš — Portfolio

Portfolio ar interaktīvu 3D System Core / Toolkit, tehnoloģiju orbītām, scroll pārejām, projektu koda fragmentiem un CV.

## GitHub

1. Izpako ZIP failu.
2. Izveido jaunu GitHub repozitoriju, piemēram, `portfolio`.
3. Augšupielādē **mapes saturu** repozitorija saknē. `README.md`, `vercel.json` un mapei `dist` jāatrodas saknē.
4. Saglabā izmaiņas ar commit.

Svarīgi: GitHub neizpakos ZIP automātiski. Augšupielādē izpakotos failus, nevis pašu ZIP.

## Vercel

1. Vercel izvēlies **Add New → Project** un importē GitHub repozitoriju.
2. Atstāj **Root Directory** repozitorija saknē.
3. **Framework Preset:** `Other`.
4. `vercel.json` jau nosaka tukšu Build/Install Command un **Output Directory:** `dist`.
5. Spied **Deploy**. Nav nepieciešamas vides mainīgās vai datubāze.

Oficiālā konfigurācijas dokumentācija: https://vercel.com/docs/project-configuration/vercel-json

## Lokāls priekšskatījums

No projekta saknes palaid:

```bash
python3 -m http.server 8000 --directory dist
```

Atver http://localhost:8000. Lapu jāatver caur HTTP serveri, lai JavaScript moduļi un 3D darbotos.

## Tehnoloģijas un failu struktūra

- HTML, CSS un JavaScript ES moduļi.
- Three.js / WebGL, pielāgoti GLSL shaders un bloom efekti.
- `dist/index.html` — saturs un koda fragmenti.
- `dist/style.css`, `dist/upgrade.css` — dizains un pārejas.
- `dist/app.js` — lapas interaktivitāte.
- `dist/scene.js` — 3D aina.
- `dist/toolkit.js` — tehnoloģijas un projektu saites.
- `dist/matcher-demo.js` — interaktīvais mūzikas meklēšanas piemērs.
- `dist/assets/` — portrets, CV, SVG ikonas, Three.js moduļi un licences.

Three.js un ikonu licences ir iekļautas pie attiecīgajiem failiem. Visi lapas faili ir gatavi izvietošanai; npm instalācija un kompilēšana nav nepieciešama. Arhīvs sagatavots no portfolio versijas `5f79c6c`.
