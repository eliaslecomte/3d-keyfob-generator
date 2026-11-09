# Keyfob 3D Generator

A small React + Vite app that turns text into a 3D-printable keyfob. Type your
text, preview the keyfob live in the browser (Three.js), and download a
print-ready **STL**.

## Features

- Live 3D preview with orbit/zoom controls ([@react-three/fiber](https://github.com/pmndrs/react-three-fiber) + [drei](https://github.com/pmndrs/drei))
- Auto-sized rounded "stadium" plate with a keyring hole
- Raised, extruded 3D text
- Adjustable text size and plate/text colours
- One-click **binary STL** export (dimensions in millimetres, ready to slice)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Deploying

The output is a fully static site in `dist/`.

**Netlify** — connect the repo (a `netlify.toml` is included), or drag-and-drop
the `dist/` folder. Build command `npm run build`, publish directory `dist`.

**Cloudflare Pages** — set the build command to `npm run build` and the build
output directory to `dist`.

## How it works

- `src/Keyfob.jsx` builds the geometry: a rounded-rectangle plate (`THREE.Shape`
  + `ExtrudeGeometry`) with a punched hole, plus extruded text (`<Text3D>`). The
  plate is auto-sized from the text's bounding box.
- `src/exportStl.js` walks the keyfob group with three's `STLExporter` and
  triggers a binary `.stl` download.
- `src/assets/helvetiker_bold.typeface.json` is the Helvetiker bold typeface
  from three's examples, vendored because newer three releases no longer
  publish the example fonts.

All measurements are in millimetres, so the STL slices at real-world scale.
