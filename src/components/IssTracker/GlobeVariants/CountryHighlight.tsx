import React, { useEffect } from 'react';
import ThreeGlobe from 'three-globe';
import useISSPosition from '../Iss/IssPosition';
import useCountryDetection from '../../../hooks/useCountryDetection';

interface Props {
  globe: ThreeGlobe;
}

const CountryHighlight: React.FC<Props> = ({ globe }) => {
  const { position } = useISSPosition();
  const { feature } = useCountryDetection(position?.lat, position?.lng);

  useEffect(() => {
    globe.polygonCapColor(() => 'rgba(255,255,255,0.06)');
    globe.polygonSideColor(() => 'rgba(0,0,0,0)');
    globe.polygonStrokeColor(() => 'rgba(255,255,255,0.65)');
    globe.polygonAltitude(() => 0.005);
    globe.polygonsTransitionDuration(400);
  }, [globe]);

  useEffect(() => {
    globe.polygonsData(feature ? [feature] : []);
  }, [globe, feature]);

  useEffect(() => {
    return () => { globe.polygonsData([]); };
  }, [globe]);

  return null;
};

export default CountryHighlight;
