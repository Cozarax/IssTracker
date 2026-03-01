interface Props {
  mounted: boolean;
  debugPaused: boolean;
  onToggleDebugPause: () => void;
}

export default function HudDebugBadge({ mounted, debugPaused, onToggleDebugPause }: Props) {
  return (
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
  );
}
