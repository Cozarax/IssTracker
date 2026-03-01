import { createContext, useContext, useState, type ReactNode } from 'react';

interface HoverState {
  name: string;
  x: number;
  y: number;
}

interface GlobeHoverContextValue {
  hover: HoverState | null;
  setHover: (state: HoverState | null) => void;
}

const GlobeHoverContext = createContext<GlobeHoverContextValue>({
  hover: null,
  setHover: () => {},
});

export function GlobeHoverProvider({ children }: { children: ReactNode }) {
  const [hover, setHover] = useState<HoverState | null>(null);
  return (
    <GlobeHoverContext.Provider value={{ hover, setHover }}>
      {children}
    </GlobeHoverContext.Provider>
  );
}

export function useGlobeHover() {
  return useContext(GlobeHoverContext);
}
