import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import ISSMarker from './Iss/IssMarker.tsx';
import IssOrbit from './Iss/IssOrbit.tsx';
import RealisticGlobeContent from './GlobeVariants/RealisticGlobeContent.tsx';
import SciFiGlobeContent from './GlobeVariants/SciFiGlobeContent.tsx';
import GlobeCountryLayer from './GlobeVariants/GlobeCountryLayer.tsx';

interface GlobeProps {
  position?: [number, number, number];
  variant?: 'realistic' | 'scifi';
  showOrbit?: boolean;
  showCountryTracking?: boolean;
}

// Vitesse de rotation réelle de la Terre : 2π rad / jour sidéral (86 164 s)
const ROTATION_SPEED = (2 * Math.PI) / 86164;

// Angle initial : secondes écoulées depuis minuit UTC → position correcte de la Terre
function getInitialRotation(): number {
  const now = new Date();
  const secondsSinceMidnightUTC =
    now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  return secondsSinceMidnightUTC * ROTATION_SPEED;
}

const GlobeWithISS: React.FC<GlobeProps> = ({ position = [0, 0, 0], variant = 'scifi', showOrbit = true, showCountryTracking = true }) => {
  const globe = useMemo(() => new ThreeGlobe({ animateIn: false }), []);
  const groupRef = useRef<THREE.Group>(null!);
  const scaleFactor = 0.5 / globe.getGlobeRadius();

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * ROTATION_SPEED;
  });

  return (
    <group ref={groupRef} position={position} scale={[scaleFactor, scaleFactor, scaleFactor]} rotation={[0, getInitialRotation(), 0]}>
      <primitive object={globe} />

      {variant === 'realistic' && (
        <>
          <RealisticGlobeContent globe={globe} />
          {showCountryTracking && <GlobeCountryLayer globe={globe} />}
        </>
      )}
      {variant === 'scifi' && <SciFiGlobeContent globe={globe} />}

      <ISSMarker globeRadius={100} altitude={15} />
      <IssOrbit visible={showOrbit} />
    </group>
  );
};

export default GlobeWithISS;
