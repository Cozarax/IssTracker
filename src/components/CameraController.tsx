import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useISSPosition from './IssTracker/Iss/IssPosition';
import latLngToVector3 from '../utils/latLngToVector3';
import { EARTH_ROTATION_SPEED } from '../constants/earth.ts';

export type CameraMode = 'free' | 'track';
const GLOBE_SCALE    = 0.005;
const ISS_WORLD_R    = 115 * GLOBE_SCALE;

const TRACK_DIST        = 1.4;
const TRACK_DIST_MOBILE = 2.2;  // plus dezoomé sur mobile
const LERP_SPEED        = 1.6;
const MIN_DIST          = 0.65;
const MAX_DIST          = 4.0;
const ZOOM_SPEED        = 0.001;
const PINCH_SPEED       = 0.007;

const isMobile = typeof window !== 'undefined' &&
  ('ontouchstart' in window || window.innerWidth <= 768);

function earthRotationNow(): number {
  const now = new Date();
  const s = now.getUTCHours() * 3600
          + now.getUTCMinutes() * 60
          + now.getUTCSeconds()
          + now.getUTCMilliseconds() / 1000;
  return s * EARTH_ROTATION_SPEED;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

interface Props {
  mode: CameraMode;
}

export default function CameraController({ mode }: Props) {
  const { camera } = useThree();
  const { position } = useISSPosition();

  const issVec       = useRef(new THREE.Vector3());
  const Y_AXIS       = useRef(new THREE.Vector3(0, 1, 0));
  const currSph      = useRef(new THREE.Spherical());
  const targetSph    = useRef(new THREE.Spherical());
  const tempVec      = useRef(new THREE.Vector3());
  // Rayon initial selon le device
  const targetRadius    = useRef(isMobile ? TRACK_DIST_MOBILE : TRACK_DIST);
  const lastPinchDist   = useRef<number | null>(null);

  // Molette (desktop) + pinch (mobile)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      targetRadius.current = THREE.MathUtils.clamp(
        targetRadius.current + e.deltaY * ZOOM_SPEED,
        MIN_DIST, MAX_DIST
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || lastPinchDist.current === null) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist  = Math.sqrt(dx * dx + dy * dy);
      const delta = lastPinchDist.current - dist; // positif = pinch in = dezoom
      targetRadius.current = THREE.MathUtils.clamp(
        targetRadius.current + delta * PINCH_SPEED,
        MIN_DIST, MAX_DIST
      );
      lastPinchDist.current = dist;
    };

    const onTouchEnd = () => { lastPinchDist.current = null; };

    window.addEventListener('wheel',      onWheel,      { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd);
    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  // Priority 1 → s'exécute APRÈS OrbitControls (priority 0)
  // En mode free : OrbitControls gère la direction, on override uniquement le rayon
  // En mode track : on contrôle entièrement la caméra
  useFrame((_, delta) => {
    const t = Math.min(1, LERP_SPEED * delta);

    if (mode === 'track' && position) {
      // ── Track ISS ─────────────────────────────────────────────────────────
      issVec.current.copy(
        latLngToVector3({ lat: position.lat, lng: position.lng }, ISS_WORLD_R)
      );
      issVec.current.applyAxisAngle(Y_AXIS.current, earthRotationNow());

      tempVec.current.copy(issVec.current).normalize().multiplyScalar(targetRadius.current);
      targetSph.current.setFromVector3(tempVec.current);

      currSph.current.setFromVector3(camera.position);
      currSph.current.phi    = THREE.MathUtils.lerp(currSph.current.phi,   targetSph.current.phi,   t);
      currSph.current.theta  = lerpAngle(currSph.current.theta, targetSph.current.theta, t);
      currSph.current.radius = THREE.MathUtils.lerp(currSph.current.radius, targetRadius.current,   t);

      camera.position.setFromSpherical(currSph.current);
      camera.lookAt(0, 0, 0);

    } else if (mode === 'free') {
      // ── Free — OrbitControls gère phi/theta, on lerp uniquement le rayon ──
      const currentLen = camera.position.length();
      if (currentLen < 0.001) return;
      const newLen = THREE.MathUtils.lerp(currentLen, targetRadius.current, t);
      camera.position.setLength(newLen);
    }
  }, 1); // priority 1 = après OrbitControls

  return null;
}
