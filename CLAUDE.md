# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at localhost:4321
npm run build    # Production build to ./dist/
npm run preview  # Preview the production build
```

There are no tests in this project.

## Tech Stack

- **Astro 5** – static site framework, single page (`src/pages/index.astro`)
- **React 19** via `@astrojs/react` – all interactive UI rendered with `client:only="react"`
- **React Three Fiber** + **Three.js** + **three-globe** – 3D rendering
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **GLSL shaders** via `vite-plugin-glsl` (imported directly as modules)
- **satellite.js** – TLE-based orbit propagation
- **SunCalc** – real-time sun position

## Architecture

### Component Tree

```
IssTrackerScene          ← Top-level React root, manages all state + R3F Canvas
├── ISSPositionProvider  ← Polls wheretheiss.at API every 4s; single source of truth
├── GlobeHoverProvider   ← Shares hover state between 3D canvas and HTML overlay
├── Canvas (R3F)
│   ├── GlobeWithISS     ← ThreeGlobe instance + rotation; accepts variant prop
│   │   ├── RealisticGlobeContent  ← Custom GLSL shaders, atmosphere, sun uniforms
│   │   ├── SciFiGlobeContent      ← Transparent cyan globe with country polygons
│   │   ├── GlobeCountryLayer      ← Invisible sphere for raycasting; highlights countries
│   │   ├── ISSMarker              ← GLTF model (/models/iss.glb) + ripple rings
│   │   └── IssOrbit               ← TLE-based past/future orbit path (satellite.js)
│   ├── CameraController ← Runs at priority=1 (after OrbitControls); track/free modes
│   └── OrbitControls    ← Only active in 'free' camera mode and when not pinching
└── IssHud               ← HTML overlay; splits into HudDesktop + HudMobile
    └── GlobeHoverTooltip ← Country name tooltip, positioned from GlobeHoverContext
```

### Key Patterns

**ISS position**: `ISSPositionProvider` in `src/components/IssTracker/Iss/IssPosition.tsx` is the single fetch point. Consumers call `useISSPosition()` (read-only hook). The `paused` prop enables a debug freeze mode.

**Earth rotation**: The `GlobeWithISS` group rotates via `useFrame` delta accumulation using `EARTH_ROTATION_SPEED = (2π) / 86164` rad/s from `src/constants/earth.ts`. Initial rotation is calibrated from UTC seconds since midnight so the globe starts at the correct orientation.

**Sun direction**: `useRealSunDirection` computes sun position via SunCalc every 60 seconds in *geographic space* (before globe rotation). `RealisticGlobeContent` re-applies the globe's current Y rotation each frame before writing to shader uniforms — this keeps `uSunDirection` and `vNormal` in the same world space.

**Country detection**: GeoJSON (`/data/custom.geo.json`) is fetched once and cached at module level in `src/hooks/useCountryDetection.ts`. After load, `detectCountrySync()` provides zero-async lookups. `GlobeCountryLayer` uses an invisible raycasting sphere, converts world-space intersections to lat/lng, then calls `detectCountrySync`.

**Globe hover state**: `GlobeHoverContext` bridges the 3D canvas (where pointer events fire) and the HTML overlay (where the tooltip renders). Components access it via `useGlobeHover()`.

**Camera modes**: `CameraController` (`src/components/CameraController.tsx`) runs at `useFrame` priority 1 (after OrbitControls at priority 0). In `track` mode it follows the ISS position rotated by current earth angle. In `free` mode, OrbitControls handles direction while CameraController only lerps the radius. Mobile pinch disables OrbitControls to prevent conflict.

**Globe coordinate system**: `three-globe` uses an internal radius of 100 units. The globe group is scaled by `0.5 / globe.getGlobeRadius()` = 0.005. ISS marker is placed at `globeRadius + 15 = 115` pre-scale units, equaling `0.575` in world space.

**Orbit visualization**: `IssOrbit` fetches TLE from `wheretheiss.at` (primary) then CelesTrak (fallback), refreshes every 5 minutes. Uses `satellite.js` to propagate 45 min past and 93 min future paths (roughly one full orbit), displayed as separate `<Line>` segments with animated dash offset.

**Debug mode**: Append `?debug` to the URL to enable the `lil-gui` panel for atmosphere/shader color tuning.

### Public Assets

- `/models/iss.glb` – ISS 3D model (preloaded via `useGLTF.preload`)
- `/data/custom.geo.json` – Country boundary polygons for detection and highlighting
- `/img/` – Earth textures: `8k_earth_daymap.jpg`, `8k_earth_nightmap.jpg`, `specularClouds.jpg`
