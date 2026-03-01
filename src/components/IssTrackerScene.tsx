import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GlobeWithISS from './IssTracker/index.tsx';
import Starfield from './Starfield.tsx';
import IssHud from './IssHud.tsx';
import CameraController, { type CameraMode } from './CameraController.tsx';
import IssLoadingScreen from './IssLoadingScreen.tsx';
import GlobeHoverTooltip from './GlobeHoverTooltip.tsx';
import ShootingStars from './ShootingStars.tsx';
import { ISSPositionProvider } from './IssTracker/Iss/IssPosition.tsx';

export default function IssTrackerScene() {
  const [showOrbit,           setShowOrbit]           = useState(false);
  const [showCountryTracking, setShowCountryTracking] = useState(true);
  const [cameraMode,          setCameraMode]          = useState<CameraMode>('track');
  const [debugPaused,         setDebugPaused]         = useState(false);

  return (
    <ISSPositionProvider intervalMs={4000} paused={debugPaused}>
    <Suspense fallback={<IssLoadingScreen />}>
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, typeof window !== 'undefined' && window.innerWidth <= 768 ? 3.8 : 2.7], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000005']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />

        <Starfield />
        <ShootingStars />
        <GlobeWithISS variant='realistic' showOrbit={showOrbit} showCountryTracking={showCountryTracking} />

        <CameraController mode={cameraMode} />

        <OrbitControls
          enabled={cameraMode === 'free'}
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

      <IssHud
        showOrbit={showOrbit}
        onToggleOrbit={() => setShowOrbit(v => !v)}
        showCountryTracking={showCountryTracking}
        onToggleCountryTracking={() => setShowCountryTracking(v => !v)}
        cameraMode={cameraMode}
        onSetCameraMode={setCameraMode}
        debugPaused={debugPaused}
        onToggleDebugPause={() => setDebugPaused(v => !v)}
      />
      <GlobeHoverTooltip />
    </div>
    </Suspense>
    </ISSPositionProvider>
  );
}
