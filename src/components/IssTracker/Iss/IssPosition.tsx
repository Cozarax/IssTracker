import { useState, useEffect } from 'react';

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

const fetchISSPosition = async (): Promise<ISSPosition> => {
  const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return {
    lat: data.latitude,
    lng: data.longitude,
    altitude: data.altitude,          // km
    velocity: data.velocity / 3600,   // km/h → km/s
  };
};

const useISSPosition = (intervalMs: number = 4000): ISSPositionState => {
  const [state, setState] = useState<ISSPositionState>({
    position: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const updatePosition = async () => {
      try {
        const position = await fetchISSPosition();
        if (isMounted) setState({ position, loading: false, error: null });
      } catch (err) {
        if (isMounted)
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Fetch failed',
          }));
      }
    };

    updatePosition();
    const id = setInterval(updatePosition, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
};

export default useISSPosition;
