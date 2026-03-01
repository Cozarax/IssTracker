import { useEffect } from 'react';
import SunCalc from 'suncalc';
import * as THREE from 'three';

/**
 * Calcule la direction du soleil en coordonnées monde du globe.
 * Utilise la position az/alt depuis lat=0,lng=0 (méridien de Greenwich).
 *
 * Système de coordonnées THREE.js du globe :
 *   +Y = pôle nord, +Z = lat=0 lng=0, +X = lat=0 lng=90°E
 *
 * suncalc : azimuth depuis le sud, positif vers l'ouest
 *   → sunX = -sin(az)*cos(alt)
 *   → sunY = -cos(az)*cos(alt)
 *   → sunZ =  sin(alt)
 */
// Décalage angulaire en degrés sur l'axe Y pour corriger l'alignement jour/nuit.
// Valeur positive = nuit se déplace vers la droite.
const SUN_Y_OFFSET_DEG = 15;

function computeSunDirection(): THREE.Vector3 {
  const { altitude, azimuth } = SunCalc.getPosition(new Date(), 0, 0);
  const v = new THREE.Vector3(
    -Math.sin(azimuth) * Math.cos(altitude),
    -Math.cos(azimuth) * Math.cos(altitude),
     Math.sin(altitude)
  ).normalize();
  v.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(SUN_Y_OFFSET_DEG));
  return v;
}

export function useRealSunDirection(
  sunDirection: THREE.Vector3,
  onUpdate: () => void
): void {
  useEffect(() => {
    sunDirection.copy(computeSunDirection());
    onUpdate();

    const id = setInterval(() => {
      sunDirection.copy(computeSunDirection());
      onUpdate();
    }, 60_000);

    return () => clearInterval(id);
  }, [sunDirection, onUpdate]);
}
