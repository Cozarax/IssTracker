import { useEffect, useState } from 'react';
import useISSPosition from './IssTracker/Iss/IssPosition';
import { type CameraMode } from './CameraController';

interface IssHudProps {
  showOrbit: boolean;
  onToggleOrbit: () => void;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
}

function fmt(val: number | undefined, dec: number): string {
  if (val === undefined || val === null) return '·····';
  return val.toFixed(dec);
}

function sign(val: number | undefined): string {
  if (val === undefined) return '';
  return val >= 0 ? '+' : '';
}

export default function IssHud({ showOrbit, onToggleOrbit, cameraMode, onSetCameraMode }: IssHudProps) {
  const { position, loading } = useISSPosition(4000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        @keyframes hud-enter {
          from { opacity: 0; transform: translateY(-50%) translateX(-12px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes hud-flicker {
          0%,89%,91%,93%,100% { opacity: 1; }
          90%   { opacity: 0.65; }
          92%   { opacity: 0.82; }
        }
        @keyframes hud-pulse {
          0%,100% { opacity: 1;   box-shadow: 0 0 6px rgba(255,255,255,0.8); }
          50%     { opacity: 0.3; box-shadow: 0 0 2px rgba(255,255,255,0.3); }
        }
        @keyframes hud-pulse-green {
          0%,100% { opacity: 1;   box-shadow: 0 0 6px rgba(74,222,128,0.9); }
          50%     { opacity: 0.4; box-shadow: 0 0 2px rgba(74,222,128,0.4); }
        }
        @keyframes hud-blink {
          0%,49% { opacity: 1; }
          50%,100%{ opacity: 0; }
        }
        @keyframes hud-scan {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }

        .hud-root {
          position: fixed;
          top: 50%;
          left: 32px;
          transform: translateY(-50%);
          z-index: 100;
          pointer-events: none;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          opacity: 0;
        }
        .hud-root.hud-visible {
          animation: hud-enter 0.5s 0.2s ease both;
          opacity: 1;
          transform: translateY(-50%);
        }

        /* ── outer frame — bordure arrondie complète ── */
        .hud-frame {
          position: relative;
          padding: 2px;
          border: 1px solid rgba(255,255,255,0.45);
          border-radius: 10px;
        }

        /* ── inner panel ── */
        .hud-panel {
          position: relative;
          background: rgba(2, 4, 10, 0.65);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          backdrop-filter: blur(8px);
          overflow: hidden;
          min-width: 260px;
        }

        /* scanlines */
        .hud-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.018) 2px,
            rgba(255,255,255,0.018) 4px
          );
          animation: hud-scan 6s linear infinite;
        }

        /* ── header ── */
        .hud-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 14px 20px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          animation: hud-flicker 9s ease-in-out infinite;
        }
        .hud-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #57fa00;
          animation: hud-pulse 2.2s ease-in-out infinite;
        }
        .hud-title {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
        }

        /* ── data rows ── */
        .hud-body {
          padding: 14px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hud-row {
          display: flex;
          align-items: baseline;
          gap: 0;
        }
        .hud-lbl {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          width: 38px;
          flex-shrink: 0;
        }
        .hud-val {
          font-size: 16px;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.04em;
          flex: 1;
          text-align: right;
        }
        .hud-unit {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.12em;
          margin-left: 5px;
          width: 30px;
          flex-shrink: 0;
        }
        .hud-loading {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.22em;
          padding: 14px 20px 12px;
        }
        .hud-loading span {
          animation: hud-blink 1s step-end infinite;
        }

        /* ── orbit toggle ── */
        .hud-toggle-wrap {
          border-top: 1px solid rgba(255,255,255,0.08);
          pointer-events: all;
        }
        .hud-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 11px 20px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          transition: background 0.15s;
        }
        .hud-toggle:hover {
          background: rgba(255,255,255,0.04);
        }
        .hud-toggle-lbl {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .hud-toggle:hover .hud-toggle-lbl {
          color: rgba(255,255,255,0.7);
        }
        .hud-toggle-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.12em;
          transition: color 0.2s;
        }
        .hud-toggle-chip.on  { color: rgba(255,255,255,0.85); }
        .hud-toggle-chip.off { color: rgba(255,255,255,0.2); }
        .hud-led {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .hud-led.on {
          background: #4ade80;
          box-shadow: 0 0 7px rgba(74,222,128,0.9);
          animation: hud-pulse-green 2.2s ease-in-out infinite;
        }
        .hud-led.off {
          background: #f87171;
          box-shadow: 0 0 5px rgba(248,113,113,0.6);
        }

        /* ── camera mode selector ── */
        .hud-cam-wrap {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 11px 20px 12px;
          pointer-events: all;
        }
        .hud-cam-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hud-cam-lbl {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .hud-cam-btns {
          display: flex;
          gap: 4px;
          margin-left: auto;
        }
        .hud-cam-btn {
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px;
          background: none;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          color: rgba(255,255,255,0.3);
        }
        .hud-cam-btn:hover {
          border-color: rgba(255,255,255,0.45);
          color: rgba(255,255,255,0.7);
        }
        .hud-cam-btn.active {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.75);
          color: rgba(255,255,255,0.95);
        }
      `}</style>

      <div className={`hud-root${mounted ? ' hud-visible' : ''}`}>
        <div className="hud-frame">

          <div className="hud-panel">

            {/* Header */}
            <div className="hud-header">
              <div className="hud-status-dot" />
              <span className="hud-title">ISS · Tracking</span>
            </div>

            {/* Data */}
            {loading && !position ? (
              <div className="hud-loading">Acquiring signal<span>_</span></div>
            ) : (
              <div className="hud-body">
                <div className="hud-row">
                  <span className="hud-lbl">LAT</span>
                  <span className="hud-val">{sign(position?.lat)}{fmt(position?.lat, 4)}</span>
                  <span className="hud-unit">°</span>
                </div>
                <div className="hud-row">
                  <span className="hud-lbl">LNG</span>
                  <span className="hud-val">{sign(position?.lng)}{fmt(position?.lng, 4)}</span>
                  <span className="hud-unit">°</span>
                </div>
                <div className="hud-row">
                  <span className="hud-lbl">ALT</span>
                  <span className="hud-val">{fmt(position?.altitude, 1)}</span>
                  <span className="hud-unit">km</span>
                </div>
                <div className="hud-row">
                  <span className="hud-lbl">VEL</span>
                  <span className="hud-val">{fmt(position?.velocity, 2)}</span>
                  <span className="hud-unit">km/s</span>
                </div>
              </div>
            )}

            {/* Orbit toggle */}
            <div className="hud-toggle-wrap">
              <button className="hud-toggle" onClick={onToggleOrbit}>
                <span className="hud-toggle-lbl">Orbit.Trace</span>
                <span className={`hud-toggle-chip ${showOrbit ? 'on' : 'off'}`}>
                  <span className={`hud-led ${showOrbit ? 'on' : 'off'}`} />
                  {showOrbit ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Camera mode */}
            <div className="hud-cam-wrap">
              <div className="hud-cam-row">
                <span className="hud-cam-lbl">Cam.View</span>
                <div className="hud-cam-btns">
                  <button
                    className={`hud-cam-btn ${cameraMode === 'free' ? 'active' : ''}`}
                    onClick={() => onSetCameraMode('free')}
                  >
                    Free
                  </button>
                  <button
                    className={`hud-cam-btn ${cameraMode === 'track' ? 'active' : ''}`}
                    onClick={() => onSetCameraMode('track')}
                  >
                    Track ISS
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
