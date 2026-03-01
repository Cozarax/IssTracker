import { useGlobeHover } from '../contexts/GlobeHoverContext';

export default function GlobeHoverTooltip() {
  const { hover } = useGlobeHover();

  if (!hover) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: hover.x + 16,
        top: hover.y - 28,
        pointerEvents: 'none',
        zIndex: 200,
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.88)',
        background: 'rgba(2,4,10,0.78)',
        border: '1px solid rgba(255,255,255,0.28)',
        borderRadius: '5px',
        padding: '5px 10px',
        backdropFilter: 'blur(6px)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {hover.name}
    </div>
  );
}
