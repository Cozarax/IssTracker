import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ISSPosition = {
  lat: number;
  lng: number;
  altitude: number;  // km
  velocity: number;  // km/s
};

export type ISSPositionState = {
  position: ISSPosition | null;
  loading: boolean;
  error: string | null;
};

// ── Context ────────────────────────────────────────────────────────────────────
const ISSPositionContext = createContext<ISSPositionState>({
  position: null,
  loading: true,
  error: null,
});

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchISSPosition = async (): Promise<ISSPosition> => {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return {
    lat:      data.latitude,
    lng:      data.longitude,
    altitude: data.altitude,
    velocity: data.velocity / 3600, // km/h → km/s
  };
};

// ── Provider — un seul fetch pour toute l'app ──────────────────────────────────
interface ProviderProps {
  children: ReactNode;
  intervalMs?: number;
  paused?: boolean;
}

export function ISSPositionProvider({ children, intervalMs = 4000, paused = false }: ProviderProps) {
  const [state, setState] = useState<ISSPositionState>({
    position: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (paused) return;

    let isMounted = true;

    const update = async () => {
      console.log(`[ISS] fetch @ ${new Date().toISOString()}`);
      try {
        const position = await fetchISSPosition();
        if (isMounted) setState({ position, loading: false, error: null });
      } catch (err) {
        console.warn('[ISS] fetch failed:', err);
        if (isMounted)
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Fetch failed',
          }));
      }
    };

    update();
    const id = setInterval(update, intervalMs);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [intervalMs, paused]);

  return (
    <ISSPositionContext.Provider value={state}>
      {children}
    </ISSPositionContext.Provider>
  );
}

// ── Hook — lecture seule, zéro fetch ──────────────────────────────────────────
export default function useISSPosition(): ISSPositionState {
  return useContext(ISSPositionContext);
}
