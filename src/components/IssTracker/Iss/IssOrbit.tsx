import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { type Vector3 } from 'three';
import * as satellite from 'satellite.js';
import latLngToVector3 from '../../../utils/latLngToVector3';

const ORBIT_RADIUS   = 115; // globe radius (100) + altitude (15)
const PAST_MINUTES   = 45;
const FUTURE_MINUTES = 93;  // ~1 full orbit
const STEP_SECONDS   = 20;

// wheretheiss.at : même domaine que l'API position → pas de problème CORS
const WHERETHEISS_TLE_URL = 'https://api.wheretheiss.at/v1/satellites/25544/tles';
// CelesTrak en second recours (peut renvoyer 403 depuis le navigateur)
const CELESTRAK_TLE_URL   = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';

type Segments = {
  pastPoints:   Vector3[];
  futurePoints: Vector3[];
  futureColors: [number, number, number][];
};

async function fetchTLE(): Promise<{ line1: string; line2: string }> {
  // 1. wheretheiss.at (JSON, CORS OK)
  try {
    const res = await fetch(WHERETHEISS_TLE_URL);
    if (res.ok) {
      const data = await res.json();
      if (data.line1 && data.line2) return { line1: data.line1, line2: data.line2 };
    }
  } catch {}

  // 2. CelesTrak (texte brut, peut échouer en navigateur)
  try {
    const res   = await fetch(CELESTRAK_TLE_URL);
    if (res.ok) {
      const text  = await res.text();
      const lines = text.trim().split('\n').map(l => l.trim());
      if (lines.length >= 3) return { line1: lines[1], line2: lines[2] };
    }
  } catch {}

  // 3. Aucune source disponible — on retourne null pour signaler l'échec
  throw new Error('TLE unavailable');
}

function propagate(satrec: satellite.SatRec, date: Date): Vector3 | null {
  const pv = satellite.propagate(satrec, date);
  if (!pv.position || typeof pv.position === 'boolean') return null;
  const pos = pv.position as satellite.EciVec3<number>;
  if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) return null;
  const gmst = satellite.gstime(date);
  const gd   = satellite.eciToGeodetic(
    pv.position as satellite.EciVec3<number>,
    gmst
  );
  return latLngToVector3(
    { lat: satellite.degreesLat(gd.latitude), lng: satellite.degreesLong(gd.longitude) },
    ORBIT_RADIUS
  );
}

function buildSegments(satrec: satellite.SatRec, now: Date): Segments {
  const pastPoints:   Vector3[]            = [];
  const futurePoints: Vector3[]            = [];
  const futureColors: [number, number, number][] = [];

  // Passé : de (now - 45min) → now
  const pastSteps = Math.ceil(PAST_MINUTES * 60 / STEP_SECONDS);
  for (let i = pastSteps; i >= 0; i--) {
    const pt = propagate(satrec, new Date(now.getTime() - i * STEP_SECONDS * 1000));
    if (pt) pastPoints.push(pt);
  }

  // Futur : de now → (now + 93min), avec dégradé de couleur
  const futureSteps = Math.ceil(FUTURE_MINUTES * 60 / STEP_SECONDS);
  for (let i = 0; i <= futureSteps; i++) {
    const pt = propagate(satrec, new Date(now.getTime() + i * STEP_SECONDS * 1000));
    if (!pt) continue;
    futurePoints.push(pt);

    // Dégradé : blanc près de l'ISS → quasi transparent en fin d'orbite
    const fade  = 1 - i / futureSteps;
    const eased = Math.pow(fade, 0.6);
    futureColors.push([eased, eased, eased * 1.05]); // légèrement bleuté
  }

  return { pastPoints, futurePoints, futureColors };
}

export default function IssOrbit({ visible = true }: { visible?: boolean }) {
  const [segments, setSegments] = useState<Segments | null>(null);
  const lineRef = useRef<any>(null);

  const load = async () => {
    try {
      const { line1, line2 } = await fetchTLE();
      const satrec = satellite.twoline2satrec(line1, line2);
      setSegments(buildSegments(satrec, new Date()));
    } catch {
      // Toutes les sources TLE sont indisponibles — on ne dessine pas l'orbite
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh toutes les 5 min
    return () => clearInterval(id);
  }, []);

  // Tirets animés sur le chemin futur — flux qui avance
  useFrame((_, delta) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset -= delta * 0.22;
    }
  });

  if (
    !visible ||
    !segments ||
    segments.pastPoints.length < 2 ||
    segments.futurePoints.length < 2
  ) return null;

  return (
    <>
      {/* Trace passée — trail fantôme */}
      <Line
        points={segments.pastPoints}
        color="#aaaacc"
        lineWidth={0.5}
        transparent
        opacity={0.12}
      />

      {/* Orbite future — blanc doux avec tirets animés */}
      <Line
        ref={lineRef}
        points={segments.futurePoints}
        vertexColors={segments.futureColors}
        lineWidth={1.0}
        dashed
        dashSize={2}
        gapSize={1.2}
        transparent
        opacity={0.55}
      />
    </>
  );
}
