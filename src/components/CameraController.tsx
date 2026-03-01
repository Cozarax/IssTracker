import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useISSPosition from './IssTracker/Iss/IssPosition';
import latLngToVector3 from '../utils/latLngToVector3';

export type CameraMode = 'free' | 'track';

const ROTATION_SPEED = (2 * Math.PI) / 86164;
const GLOBE_SCALE    = 0.005;             // 0.5 / 100
const ISS_WORLD_R    = 115 * GLOBE_SCALE; // ≈ 0.575

// Camera distance in track mode — légèrement dezoomé
const TRACK_DIST  = 1.4;
const LERP_SPEED  = 1.6;

function earthRotationNow(): number {
  const now = new Date();
  const s = now.getUTCHours() * 3600
          + now.getUTCMinutes() * 60
          + now.getUTCSeconds()
          + now.getUTCMilliseconds() / 1000;
  return s * ROTATION_SPEED;
}

/**
 * Interpolation angulaire sur le chemin le plus court (évite de traverser 360°).
 * Indispensable pour theta qui peut être n'importe quelle valeur.
 */
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
  const { position } = useISSPosition(4000);

  const issVec    = useRef(new THREE.Vector3());
  const Y_AXIS    = useRef(new THREE.Vector3(0, 1, 0));
  // Réutilisés chaque frame pour éviter les allocations GC
  const currSph   = useRef(new THREE.Spherical());
  const targetSph = useRef(new THREE.Spherical());
  const tempVec   = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (mode !== 'track' || !position) return;

    // 1. Position ISS en world space
    issVec.current.copy(
      latLngToVector3({ lat: position.lat, lng: position.lng }, ISS_WORLD_R)
    );
    issVec.current.applyAxisAngle(Y_AXIS.current, earthRotationNow());

    // 2. Cible : même direction que l'ISS, à TRACK_DIST de l'origine
    tempVec.current.copy(issVec.current).normalize().multiplyScalar(TRACK_DIST);
    targetSph.current.setFromVector3(tempVec.current);

    // 3. Caméra courante → sphériques
    currSph.current.setFromVector3(camera.position);

    // 4. Interpolation SPHÉRIQUE — la caméra contourne le globe, ne le traverse pas
    const t = Math.min(1, LERP_SPEED * delta);
    currSph.current.phi    = THREE.MathUtils.lerp(currSph.current.phi,   targetSph.current.phi, t);
    currSph.current.theta  = lerpAngle(currSph.current.theta, targetSph.current.theta, t);
    currSph.current.radius = THREE.MathUtils.lerp(currSph.current.radius, TRACK_DIST,  t);

    camera.position.setFromSpherical(currSph.current);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
