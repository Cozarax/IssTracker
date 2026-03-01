export default function IssLoadingScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        @keyframes ls-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ls-orbit-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes ls-pulse {
          0%, 100% { opacity: 1;   transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.4; transform: translate(-50%, -50%) scale(0.7); }
        }
        @keyframes ls-blink {
          0%, 49% { opacity: 1; }
          50%,100% { opacity: 0; }
        }
        @keyframes ls-flicker {
          0%,88%,90%,92%,100% { opacity: 1; }
          89%  { opacity: 0.5; }
          91%  { opacity: 0.8; }
        }
        @keyframes ls-enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ls-scan {
          from { background-position: 0 0; }
          to   { background-position: 0 80px; }
        }

        .ls-root {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: #000005;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 36px;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          animation: ls-enter 0.4s ease both;
          overflow: hidden;
        }

        /* scanlines sur tout l'écran */
        .ls-root::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.012) 2px,
            rgba(255,255,255,0.012) 4px
          );
          animation: ls-scan 8s linear infinite;
        }

        /* ── orrery ── */
        .ls-orrery {
          position: relative;
          width: 110px;
          height: 110px;
          flex-shrink: 0;
        }

        /* anneau extérieur */
        .ls-ring-outer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
        }
        /* dot sur l'anneau extérieur */
        .ls-ring-outer::before {
          content: '';
          position: absolute;
          top: -3.5px;
          left: 50%;
          width: 6px;
          height: 6px;
          margin-left: -3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 8px rgba(255,255,255,0.6);
          transform-origin: 3px 58.5px;
          animation: ls-orbit 3s linear infinite;
        }

        /* anneau intérieur */
        .ls-ring-inner {
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .ls-ring-inner::before {
          content: '';
          position: absolute;
          top: -2.5px;
          left: 50%;
          width: 4px;
          height: 4px;
          margin-left: -2px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          transform-origin: 2px 37px;
          animation: ls-orbit-reverse 2s linear infinite;
        }

        /* point central */
        .ls-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 12px rgba(255,255,255,0.6);
          animation: ls-pulse 2s ease-in-out infinite;
        }

        /* ── texte ── */
        .ls-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .ls-title {
          font-size: 13px;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          animation: ls-flicker 7s ease-in-out infinite;
        }

        .ls-divider {
          width: 120px;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255,255,255,0.25),
            transparent
          );
        }

        .ls-status {
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }
        .ls-cursor {
          animation: ls-blink 1s step-end infinite;
        }
      `}</style>

      <div className="ls-root">

        <div className="ls-orrery">
          <div className="ls-ring-outer" />
          <div className="ls-ring-inner" />
          <div className="ls-core" />
        </div>

        <div className="ls-text">
          <span className="ls-title">ISS Tracker</span>
          <div className="ls-divider" />
          <span className="ls-status">
            Loading telemetry<span className="ls-cursor">_</span>
          </span>
        </div>

      </div>
    </>
  );
}
