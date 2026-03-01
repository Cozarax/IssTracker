import { useEffect, useState } from 'react';
import useISSPosition from './IssTracker/Iss/IssPosition';
import useCountryDetection from '../hooks/useCountryDetection';
import { type CameraMode } from './CameraController';

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

function fmt(val: number | undefined, dec: number): string {
  if (val === undefined || val === null) return '·····';
  return val.toFixed(dec);
}

function sign(val: number | undefined): string {
  if (val === undefined) return '';
  return val >= 0 ? '+' : '';
}

// ── Mobile icons ───────────────────────────────────────────────────────────────
const OrbitIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="8" rx="7" ry="3.5" stroke="currentColor" strokeWidth="1" />
    <ellipse cx="8" cy="8" rx="3.5" ry="7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <circle cx="13" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

const CrosshairIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1" />
    <line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1" />
    <line x1="12" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1" />
    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
    <line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
    <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1" />
    <line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1" />
    <line x1="12" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default function IssHud({ showOrbit, onToggleOrbit, showCountryTracking, onToggleCountryTracking, cameraMode, onSetCameraMode, debugPaused, onToggleDebugPause }: IssHudProps) {
  const { position, loading } = useISSPosition();
  const { name: countryName } = useCountryDetection(position?.lat, position?.lng);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        /* ════════════════════════════════════════════════════
           DESKTOP HUD (> 768px) — panneau complet côté gauche
           ════════════════════════════════════════════════════ */

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
          display: block;
        }
        .hud-root.hud-visible {
          animation: hud-enter 0.5s 0.2s ease both;
          opacity: 1;
          transform: translateY(-50%);
        }

        .hud-frame {
          position: relative;
          padding: 2px;
          border: 1px solid rgba(255,255,255,0.45);
          border-radius: 10px;
        }
        .hud-panel {
          position: relative;
          background: rgba(2, 4, 10, 0.65);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          backdrop-filter: blur(8px);
          overflow: hidden;
          min-width: 260px;
        }
        .hud-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 2px,
            rgba(255,255,255,0.018) 2px,
            rgba(255,255,255,0.018) 4px
          );
          animation: hud-scan 6s linear infinite;
        }

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
          width: 6px; height: 6px;
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

        .hud-body {
          padding: 14px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hud-row {
          display: flex;
          align-items: baseline;
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
        .hud-loading span { animation: hud-blink 1s step-end infinite; }

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
        .hud-toggle:hover { background: rgba(255,255,255,0.04); }
        .hud-toggle-lbl {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .hud-toggle:hover .hud-toggle-lbl { color: rgba(255,255,255,0.7); }
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
          width: 6px; height: 6px;
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

        /* ════════════════════════════════════════════════════
           DEBUG BADGE — commun desktop + mobile
           ════════════════════════════════════════════════════ */

        @keyframes ghost-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes debug-pulse {
          0%, 100% { box-shadow: 0 0 4px rgba(251,191,36,0.5); }
          50%       { box-shadow: 0 0 8px rgba(251,191,36,0.8); }
        }

        .hud-debug {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 101;
          pointer-events: all;
          opacity: 0;
        }
        .hud-debug.visible {
          animation: ghost-in 0.5s 0.7s ease both;
        }
        .hud-debug-btn {
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          font-size: 8px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px 5px 8px;
          border-radius: 20px;
          border: 1px solid rgba(251,191,36,0.25);
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
          cursor: pointer;
          color: rgba(251,191,36,0.45);
          transition: border-color 0.2s, color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .hud-debug-btn:hover {
          border-color: rgba(251,191,36,0.6);
          color: rgba(251,191,36,0.9);
          background: rgba(0,0,0,0.45);
        }
        .hud-debug-btn.paused {
          border-color: rgba(251,191,36,0.6);
          color: rgba(251,191,36,0.9);
          box-shadow: 0 0 6px rgba(251,191,36,0.2);
        }
        .hud-debug-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }
        .hud-debug-btn:not(.paused) .hud-debug-dot {
          animation: debug-pulse 1.8s ease-in-out infinite;
        }

        /* ════════════════════════════════════════════════════
           MOBILE (≤ 768px) — ghost interface
           ════════════════════════════════════════════════════ */

        @keyframes mob-in-left {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mob-in-right {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes orbit-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(74,222,128,0.5); }
          50%       { box-shadow: 0 0 12px rgba(74,222,128,0.8), 0 0 20px rgba(74,222,128,0.3); }
        }

        /* Masqué sur desktop, visible sur mobile */
        .mob-panel { display: none; }
        .mob-btns  { display: none; }

        /* Masqué sur mobile, visible sur desktop */
        @media (max-width: 768px) {
          .hud-root  { display: none !important; }

          /* ── Data panel — bas gauche ── */
          .mob-panel {
            display: block;
            position: fixed;
            bottom: calc(16px + env(safe-area-inset-bottom));
            left: 16px;
            /* Limite la largeur pour ne jamais toucher les boutons à droite */
            max-width: calc(100vw - 90px);
            background: rgba(0,0,0,0.22);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 8px;
            backdrop-filter: blur(4px);
            padding: 8px 12px 7px;
            z-index: 100;
            pointer-events: none;
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            opacity: 0;
          }
          .mob-panel.visible {
            animation: mob-in-left 0.5s 0.3s ease both;
          }
          .mob-panel-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 7px;
            letter-spacing: 0.32em;
            color: rgba(255,255,255,0.22);
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .mob-status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #4ade80;
            flex-shrink: 0;
            animation: hud-pulse-green 2.2s ease-in-out infinite;
          }
          .mob-rows {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .mob-row {
            display: flex;
            align-items: baseline;
          }
          .mob-lbl {
            font-size: 8px;
            letter-spacing: 0.2em;
            color: rgba(255,255,255,0.22);
            text-transform: uppercase;
            width: 26px;
            flex-shrink: 0;
          }
          .mob-val {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0.04em;
            flex: 1;
            text-align: right;
          }
          .mob-unit {
            font-size: 8px;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.1em;
            margin-left: 4px;
            width: 20px;
            flex-shrink: 0;
          }

          /* ── Icon buttons — bas droite ── */
          .mob-btns {
            display: flex;
            position: fixed;
            bottom: calc(16px + env(safe-area-inset-bottom));
            right: 16px;
            flex-direction: column;
            gap: 8px;
            z-index: 100;
            pointer-events: all;
            opacity: 0;
          }
          .mob-btns.visible {
            animation: mob-in-right 0.5s 0.5s ease both;
          }
          .mob-btn {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
            color: rgba(255,255,255,0.35);
            outline: none;
            -webkit-tap-highlight-color: transparent;
          }
          .mob-btn:active {
            background: rgba(255,255,255,0.08);
          }
          .mob-btn.orbit-off {
            color: rgba(248,113,113,0.55);
            border-color: rgba(248,113,113,0.25);
          }
          .mob-btn.orbit-on {
            color: rgba(74,222,128,0.9);
            border-color: rgba(74,222,128,0.45);
            animation: orbit-glow 2.5s ease-in-out infinite;
          }
          .mob-btn.cam-track {
            color: rgba(255,255,255,0.8);
            border-color: rgba(255,255,255,0.45);
          }

          /* Tooltip mobile — à gauche des boutons */
          .mob-btn::after {
            content: attr(data-tooltip);
            position: absolute;
            right: calc(100% + 10px);
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.7);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 4px;
            padding: 4px 8px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 9px;
            letter-spacing: 0.12em;
            color: rgba(255,255,255,0.6);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s;
          }
          .mob-btn:hover::after { opacity: 1; }
        }
      `}</style>

      {/* ── DEBUG BADGE (tous écrans) ── */}
      <div className={`hud-debug${mounted ? ' visible' : ''}`}>
        <button
          className={`hud-debug-btn${debugPaused ? ' paused' : ''}`}
          onClick={onToggleDebugPause}
          aria-label="Toggle API pause"
        >
          <span className="hud-debug-dot" />
          {debugPaused ? 'API · PAUSED' : 'API · LIVE'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP — panneau complet gauche-centre
          ══════════════════════════════════════════════════ */}
      <div className={`hud-root${mounted ? ' hud-visible' : ''}`}>
        <div className="hud-frame">
          <div className="hud-panel">

            <div className="hud-header">
              <div className="hud-status-dot" />
              <span className="hud-title">ISS · Tracking</span>
            </div>

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
                <div className="hud-row">
                  <span className="hud-lbl">LOC</span>
                  <span className="hud-val" style={{ fontSize: '12px' }}>
                    {countryName ?? '---'}
                  </span>
                  <span className="hud-unit" />
                </div>
              </div>
            )}

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

      {/* ══════════════════════════════════════════════════
          MOBILE — data panel bas-gauche
          ══════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════
          MOBILE — boutons icônes bas-droite
          ══════════════════════════════════════════════════ */}
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
