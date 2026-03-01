import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GlobeWithISS from './IssTracker/index.tsx';
import Starfield from './Starfield.tsx';
import IssHud from './IssHud.tsx';
import CameraController, { type CameraMode } from './CameraController.tsx';
import IssLoadingScreen from './IssLoadingScreen.tsx';

export default function IssTrackerScene() {
  const [showOrbit,  setShowOrbit]  = useState(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('free');

  return (
    <Suspense fallback={<IssLoadingScreen />}>
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000005']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />

        <Starfield />
        <GlobeWithISS variant='realistic' showOrbit={showOrbit} />

        <CameraController mode={cameraMode} />

        <OrbitControls
          enabled={cameraMode === 'free'}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.5}
          minDistance={0.70}
          maxDistance={4.0}
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

      <IssHud
        showOrbit={showOrbit}
        onToggleOrbit={() => setShowOrbit(v => !v)}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
      />
    </div>
    </Suspense>
  );
}
