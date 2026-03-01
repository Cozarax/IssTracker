import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { type ThreeEvent } from '@react-three/fiber';
import useISSPosition from '../Iss/IssPosition';
import useCountryDetection, { getFeatures, detectCountrySync, type GeoFeature } from '../../../hooks/useCountryDetection';

interface Props {
  globe: ThreeGlobe;
}

const GlobeCountryLayer: React.FC<Props> = ({ globe }) => {
  const { position: issPos } = useISSPosition();
  const { feature: issFeature } = useCountryDetection(issPos?.lat, issPos?.lng);

  const [hoverFeature, setHoverFeature] = useState<GeoFeature | null>(null);
  const hoverFeatureRef = useRef<GeoFeature | null>(null);

  // Pre-load GeoJSON so it's cached before first hover
  useEffect(() => { getFeatures(); }, []);

  // Invisible raycasting sphere — slightly proud of the globe surface
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(100.5, 32, 32), []);
  const sphereMat = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    []
  );

  // Update polygon styling + data whenever ISS or hover country changes
  useEffect(() => {
    globe.polygonCapColor(() => 'rgba(0,0,0,0)');
    globe.polygonSideColor(() => 'rgba(0,0,0,0)');
    globe.polygonStrokeColor((feat: object) =>
      feat === hoverFeature ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.50)'
    );
    globe.polygonAltitude(() => 0.005);
    globe.polygonsTransitionDuration(300);

    const features: GeoFeature[] = [];
    if (issFeature) features.push(issFeature);
    if (hoverFeature && hoverFeature !== issFeature) features.push(hoverFeature);
    globe.polygonsData(features);
  }, [globe, issFeature, hoverFeature]);

  // Cleanup on unmount
  useEffect(() => () => {
    globe.polygonsData([]);
    document.dispatchEvent(new CustomEvent('globe-hover', { detail: null }));
  }, [globe]);

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    // Convert world-space intersection → group-local geographic space
    const group = e.object.parent!;
    const local = group.worldToLocal(e.point.clone()).normalize();
    const lat = Math.asin(Math.max(-1, Math.min(1, local.y))) * (180 / Math.PI);
    const lng = Math.atan2(local.x, local.z) * (180 / Math.PI);

    // Synchronous lookup from cache (GeoJSON already loaded)
    const found = detectCountrySync(lat, lng);

    // Always dispatch to keep tooltip position in sync with cursor
    document.dispatchEvent(new CustomEvent('globe-hover', {
      detail: found
        ? { name: found.properties.name, x: e.clientX, y: e.clientY }
        : null,
    }));

    // Only trigger React re-render when country actually changes
    if (found !== hoverFeatureRef.current) {
      hoverFeatureRef.current = found;
      setHoverFeature(found);
    }
  };

  const onPointerLeave = () => {
    hoverFeatureRef.current = null;
    setHoverFeature(null);
    document.dispatchEvent(new CustomEvent('globe-hover', { detail: null }));
  };

  return (
    <mesh
      geometry={sphereGeom}
      material={sphereMat}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    />
  );
};

export default GlobeCountryLayer;
