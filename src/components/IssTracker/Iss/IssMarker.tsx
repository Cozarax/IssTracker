import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import latLngToVector3 from '../../../utils/latLngToVector3';
import useISSPosition from './IssPosition';

type Props = {
  globeRadius?: number;
  altitude?: number;
};

const RING_COUNT      = 3;
const RIPPLE_DURATION = 2.5;
const RING_DELAY      = 0.3;
const RING_MAX_SCALE  = 5;

useGLTF.preload('/models/iss.glb');

// easeOutCubic — expansion rapide au début, freine doucement à la fin
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const ISSMarker: React.FC<Props> = ({ globeRadius = 100, altitude = 15 }) => {
  const groupRef   = useRef<THREE.Group>(null!);
  const ringsRef   = useRef<(THREE.Mesh | null)[]>([]);
  const rippleStart = useRef<number>(-999);
  const prevLatLng  = useRef<{ lat: number; lng: number } | null>(null);

  const { scene }    = useGLTF('/models/iss.glb');
  const { position } = useISSPosition();

  useFrame(({ clock }) => {
    if (!groupRef.current || !position) return;

    // Déplacement
    const target = latLngToVector3(
      { lat: position.lat, lng: position.lng },
      globeRadius + altitude
    );
    groupRef.current.position.lerp(target, 0.1);
    // +Z pointe vers l'extérieur de la Terre → rings en plan XY = parallèles au sol
    groupRef.current.lookAt(0, 0, 0);

    // Déclenchement du ripple à chaque nouvelle position API
    const prev = prevLatLng.current;
    if (!prev || prev.lat !== position.lat || prev.lng !== position.lng) {
      rippleStart.current = clock.getElapsedTime();
      prevLatLng.current  = { lat: position.lat, lng: position.lng };
    }

    // Animation
    const elapsed = clock.getElapsedTime() - rippleStart.current;

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const mat      = ring.material as THREE.MeshBasicMaterial;
      const ringTime = elapsed - i * RING_DELAY;

      if (ringTime <= 0 || ringTime >= RIPPLE_DURATION) {
        ring.visible = false;
        return;
      }

      const t    = ringTime / RIPPLE_DURATION;
      const ease = easeOutCubic(t);

      ring.visible = true;
      ring.scale.setScalar(ease * RING_MAX_SCALE);
      // Fondu : opaque au début, invisible à la fin
      mat.opacity = (1 - t) * (1 - t) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.3} />
      <pointLight intensity={0.5} distance={60} color="#ffffff" />

      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={el => { ringsRef.current[i] = el; }}
          visible={false}
          // Pas de rotation : +Z du group est déjà perpendiculaire à la Terre
        >
          <ringGeometry args={[0.88, 1.0, 96]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ISSMarker;
