import { useGlobeHover } from '../contexts/GlobeHoverContext';

export default function GlobeHoverTooltip() {
  const { hover } = useGlobeHover();

  if (!hover) return null;

  return (
    <div
      className="globe-tooltip"
      style={{ left: hover.x + 16, top: hover.y - 28 }}
    >
      {hover.name}
    </div>
  );
}
