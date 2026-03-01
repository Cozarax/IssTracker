import { useState, useEffect } from 'react';
import { pointInGeoJSON } from '../utils/pointInPolygon';

interface GeoFeature {
  type: 'Feature';
  properties: { name: string; [key: string]: unknown };
  geometry: { type: string; coordinates: unknown };
}

interface CountryResult {
  name: string | null;
  feature: GeoFeature | null;
}

// Module-level cache — GeoJSON loaded once for the lifetime of the app
let cachedFeatures: GeoFeature[] | null = null;
let fetchPromise: Promise<GeoFeature[]> | null = null;

export type { GeoFeature };

export async function getFeatures(): Promise<GeoFeature[]> {
  if (cachedFeatures) return cachedFeatures;
  if (!fetchPromise) {
    fetchPromise = fetch('/data/custom.geo.json')
      .then(r => r.json())
      .then(data => {
        cachedFeatures = data.features as GeoFeature[];
        return cachedFeatures;
      });
  }
  return fetchPromise;
}

/** Synchronous lookup — returns null if GeoJSON isn't cached yet. */
export function detectCountrySync(lat: number, lng: number): GeoFeature | null {
  if (!cachedFeatures) return null;
  return cachedFeatures.find(f => pointInGeoJSON(lat, lng, f.geometry)) ?? null;
}

export default function useCountryDetection(
  lat: number | undefined,
  lng: number | undefined
): CountryResult {
  const [result, setResult] = useState<CountryResult>({ name: null, feature: null });

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;

    let cancelled = false;

    getFeatures().then(features => {
      if (cancelled) return;
      const found = features.find(f => pointInGeoJSON(lat, lng, f.geometry)) ?? null;
      setResult({ name: found?.properties.name ?? null, feature: found });
    });

    return () => { cancelled = true; };
  }, [lat, lng]);

  return result;
}
