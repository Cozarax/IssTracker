import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GlobeWithISS from './IssTracker/index.tsx';
import Starfield from './Starfield.tsx';
import ShootingStars from './ShootingStars.tsx';
import CameraController, { type CameraMode } from './CameraController.tsx';

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

interface Props {
  showOrbit: boolean;
  showCountryTracking: boolean;
  cameraMode: CameraMode;
  onReady: () => void;
}

export default function CanvasScene({ showOrbit, showCountryTracking, cameraMode, onReady }: Props) {
  const [isPinching, setIsPinching] = useState(false);

  return (
    <Canvas
      camera={{ position: [0, 0, typeof window !== 'undefined' && window.innerWidth <= 768 ? 3.8 : 2.7], fov: 50 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000005']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />

      <Starfield />
      <ShootingStars />
      <Suspense fallback={null}>
        <GlobeWithISS variant='realistic' showOrbit={showOrbit} showCountryTracking={showCountryTracking} />
        <ReadySignal onReady={onReady} />
      </Suspense>

      <CameraController mode={cameraMode} onPinchChange={setIsPinching} />

      <OrbitControls
        enabled={cameraMode === 'free' && !isPinching}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
      />

      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
