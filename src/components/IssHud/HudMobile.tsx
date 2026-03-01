import { type ISSPosition } from '../IssTracker/Iss/IssPosition';
import { type CameraMode } from '../CameraController';
import { fmt, sign } from './utils';
import { OrbitIcon, CrosshairIcon, TargetIcon, LocationIcon } from './icons';

interface Props {
  mounted: boolean;
  position: ISSPosition | null;
  loading: boolean;
  countryName: string | null;
  showOrbit: boolean;
  onToggleOrbit: () => void;
  showCountryTracking: boolean;
  onToggleCountryTracking: () => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
}

export default function HudMobile({
  mounted, position, loading, countryName,
  showOrbit, onToggleOrbit,
  showCountryTracking, onToggleCountryTracking,
  cameraMode, onSetCameraMode,
}: Props) {
  return (
    <>
      {/* Data panel — bas gauche */}
      <div className={`mob-panel${mounted ? ' visible' : ''}`}>
        <div className="mob-panel-header">
          <span className="mob-status-dot" />
          ISS · Tracking
        </div>
        <div className="mob-rows">
          <div className="mob-row">
            <span className="mob-lbl">LAT</span>
            <span className="mob-val">
              {loading && !position ? '···' : `${sign(position?.lat)}${fmt(position?.lat, 3)}`}
            </span>
            <span className="mob-unit">°</span>
          </div>
          <div className="mob-row">
            <span className="mob-lbl">LNG</span>
            <span className="mob-val">
              {loading && !position ? '···' : `${sign(position?.lng)}${fmt(position?.lng, 3)}`}
            </span>
            <span className="mob-unit">°</span>
          </div>
          <div className="mob-row">
            <span className="mob-lbl">ALT</span>
            <span className="mob-val">
              {loading && !position ? '···' : fmt(position?.altitude, 0)}
            </span>
            <span className="mob-unit">km</span>
          </div>
          <div className="mob-row">
            <span className="mob-lbl">VEL</span>
            <span className="mob-val">
              {loading && !position ? '···' : fmt(position?.velocity, 2)}
            </span>
            <span className="mob-unit">km/s</span>
          </div>
          <div className="mob-row">
            <span className="mob-lbl">LOC</span>
            <span className="mob-val">{countryName ?? '---'}</span>
            <span className="mob-unit" />
          </div>
        </div>
      </div>

      {/* Boutons icônes — bas droite */}
      <div className={`mob-btns${mounted ? ' visible' : ''}`}>
        <button
          className={`mob-btn ${showOrbit ? 'orbit-on' : 'orbit-off'}`}
          onClick={onToggleOrbit}
          data-tooltip={showOrbit ? 'Orbit: ON' : 'Orbit: OFF'}
          aria-label="Toggle orbit trace"
        >
          <OrbitIcon />
        </button>
        <button
          className={`mob-btn ${cameraMode === 'track' ? 'cam-track' : ''}`}
          onClick={() => onSetCameraMode(cameraMode === 'free' ? 'track' : 'free')}
          data-tooltip={cameraMode === 'track' ? 'Track ISS' : 'Free View'}
          aria-label="Toggle camera mode"
        >
          {cameraMode === 'track' ? <TargetIcon /> : <CrosshairIcon />}
        </button>
        <button
          className={`mob-btn ${showCountryTracking ? 'orbit-on' : 'orbit-off'}`}
          onClick={onToggleCountryTracking}
          data-tooltip={showCountryTracking ? 'Ptr.Track: ON' : 'Ptr.Track: OFF'}
          aria-label="Toggle country tracking"
        >
          <LocationIcon />
        </button>
      </div>
    </>
  );
}
