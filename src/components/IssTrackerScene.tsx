import { useState, Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { type CameraMode } from './CameraController.tsx';
import IssHud from './IssHud.tsx';
import IssLoadingScreen from './IssLoadingScreen.tsx';
import GlobeHoverTooltip from './GlobeHoverTooltip.tsx';
import { ISSPositionProvider } from './IssTracker/Iss/IssPosition.tsx';
import { GlobeHoverProvider } from '../contexts/GlobeHoverContext.tsx';

const CanvasScene = lazy(() => import('./CanvasScene.tsx'));

export default function IssTrackerScene() {
  const [showOrbit,           setShowOrbit]           = useState(false);
  const [showCountryTracking, setShowCountryTracking] = useState(true);
  const [cameraMode,          setCameraMode]          = useState<CameraMode>('track');
  const [debugPaused,         setDebugPaused]         = useState(false);
  const [sceneReady,          setSceneReady]          = useState(false);

  return (
    <ISSPositionProvider intervalMs={4000} paused={debugPaused}>
    <GlobeHoverProvider>
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      <Suspense fallback={null}>
        <CanvasScene
          showOrbit={showOrbit}
          showCountryTracking={showCountryTracking}
          cameraMode={cameraMode}
          onReady={() => setSceneReady(true)}
        />
      </Suspense>

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

      {!sceneReady && <IssLoadingScreen />}

    </div>
    </GlobeHoverProvider>
    </ISSPositionProvider>
    <Analytics />
  );
}
