import { useEffect } from 'react';
import SunCalc from 'suncalc';
import * as THREE from 'three';

/**
 * Calcule la direction du soleil en espace LOCAL du globe (avant rotation).
 * Utilise la position az/alt depuis lat=0,lng=0 (méridien de Greenwich).
 *
 * Système de coordonnées THREE.js du globe (espace local) :
 *   +Y = pôle nord, +Z = lat=0 lng=0, +X = lat=0 lng=90°E
 *
 * suncalc : azimuth depuis le sud, positif vers l'ouest
 *   → sunX = -sin(az)*cos(alt)  (composante Est)
 *   → sunY = -cos(az)*cos(alt)  (composante Nord)
 *   → sunZ =  sin(alt)          (composante radiale)
 *
 * Important : ce vecteur est en espace géographique (avant rotation du globe).
 * RealisticGlobeContent le fait pivoter chaque frame (applyAxisAngle Y)
 * avant de l'envoyer aux shaders, où il est comparé à vNormal en espace monde.
 */
function computeSunDirection(): THREE.Vector3 {
  const { altitude, azimuth } = SunCalc.getPosition(new Date(), 0, 0);
  return new THREE.Vector3(
    -Math.sin(azimuth) * Math.cos(altitude),
    -Math.cos(azimuth) * Math.cos(altitude),
     Math.sin(altitude)
  ).normalize();
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
