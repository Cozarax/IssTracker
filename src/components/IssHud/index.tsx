import { useEffect, useState } from 'react';
import useISSPosition from '../IssTracker/Iss/IssPosition';
import useCountryDetection from '../../hooks/useCountryDetection';
import { type CameraMode } from '../CameraController';
import HudDebugBadge from './HudDebugBadge';
import HudDesktop from './HudDesktop';
import HudMobile from './HudMobile';
import './hud.css';

interface IssHudProps {
  showOrbit: boolean;
  onToggleOrbit: () => void;
  showCountryTracking: boolean;
  onToggleCountryTracking: () => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  debugPaused: boolean;
  onToggleDebugPause: () => void;
}

export default function IssHud({
  showOrbit, onToggleOrbit,
  showCountryTracking, onToggleCountryTracking,
  cameraMode, onSetCameraMode,
  debugPaused, onToggleDebugPause,
}: IssHudProps) {
  const { position, loading } = useISSPosition();
  const { name: countryName } = useCountryDetection(position?.lat, position?.lng);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sharedProps = {
    mounted, position, loading, countryName,
    showOrbit, onToggleOrbit,
    showCountryTracking, onToggleCountryTracking,
    cameraMode, onSetCameraMode,
  };

  return (
    <>
      <HudDebugBadge mounted={mounted} debugPaused={debugPaused} onToggleDebugPause={onToggleDebugPause} />
      <HudDesktop {...sharedProps} />
      <HudMobile  {...sharedProps} />
    </>
  );
}
