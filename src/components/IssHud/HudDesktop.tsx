import { type ISSPosition } from '../IssTracker/Iss/IssPosition';
import { type CameraMode } from '../CameraController';
import { fmt, sign } from './utils';

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

export default function HudDesktop({
  mounted, position, loading, countryName,
  showOrbit, onToggleOrbit,
  showCountryTracking, onToggleCountryTracking,
  cameraMode, onSetCameraMode,
}: Props) {
  return (
    <div className={`hud-root${mounted ? ' hud-visible' : ''}`}>
      <div className="hud-frame">
        <div className="hud-panel">

          <div className="hud-header">
            <div className="hud-status-dot" />
            <span className="hud-title">ISS · Tracking</span>
          </div>

          <div className="hud-body">
            <div className="hud-row">
              <span className="hud-lbl">LAT</span>
              <span className="hud-val">{position ? `${sign(position.lat)}${fmt(position.lat, 4)}` : '---'}</span>
              <span className="hud-unit">°</span>
            </div>
            <div className="hud-row">
              <span className="hud-lbl">LNG</span>
              <span className="hud-val">{position ? `${sign(position.lng)}${fmt(position.lng, 4)}` : '---'}</span>
              <span className="hud-unit">°</span>
            </div>
            <div className="hud-row">
              <span className="hud-lbl">ALT</span>
              <span className="hud-val">{position ? fmt(position.altitude, 1) : '---'}</span>
              <span className="hud-unit">km</span>
            </div>
            <div className="hud-row">
              <span className="hud-lbl">VEL</span>
              <span className="hud-val">{position ? fmt(position.velocity, 2) : '---'}</span>
              <span className="hud-unit">km/s</span>
            </div>
            <div className="hud-row">
              <span className="hud-lbl">LOC</span>
              <span className="hud-val" style={{ fontSize: '12px' }}>
                {countryName ?? '---'}
              </span>
              <span className="hud-unit" />
            </div>
          </div>

          <div className="hud-toggle-wrap">
            <button className="hud-toggle" onClick={onToggleOrbit}>
              <span className="hud-toggle-lbl">Orbit.Trace</span>
              <span className={`hud-toggle-chip ${showOrbit ? 'on' : 'off'}`}>
                <span className={`hud-led ${showOrbit ? 'on' : 'off'}`} />
                {showOrbit ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div className="hud-toggle-wrap">
            <button className="hud-toggle" onClick={onToggleCountryTracking}>
              <span className="hud-toggle-lbl">Ptr.Track</span>
              <span className={`hud-toggle-chip ${showCountryTracking ? 'on' : 'off'}`}>
                <span className={`hud-led ${showCountryTracking ? 'on' : 'off'}`} />
                {showCountryTracking ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div className="hud-cam-wrap">
            <div className="hud-cam-row">
              <span className="hud-cam-lbl">Cam.View</span>
              <div className="hud-cam-btns">
                <button
                  className={`hud-cam-btn ${cameraMode === 'free' ? 'active' : ''}`}
                  onClick={() => onSetCameraMode('free')}
                >Free</button>
                <button
                  className={`hud-cam-btn ${cameraMode === 'track' ? 'active' : ''}`}
                  onClick={() => onSetCameraMode('track')}
                >Track ISS</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
