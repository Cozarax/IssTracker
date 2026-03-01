import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';


interface Props {
  globe: ThreeGlobe;
}

const SciFiGlobeContent: React.FC<Props> = ({ globe }) => {

  const customMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00ffff'),
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  useEffect(() => {
    fetch('/data/custom.geo.json')
      .then(res => res.json())
      .then(data => {
        globe.polygonsData(data.features);

        globe.globeMaterial(customMaterial)
          .atmosphereAltitude(0.01)
          .atmosphereColor('cyan')
          .polygonCapColor(() => 'rgba(0, 255, 255, 0.07)')
          .polygonSideColor(() => '')
          .polygonStrokeColor(() => 'rgb(166, 46, 196)')
          .polygonAltitude(0.007)
          .polygonsTransitionDuration(0);
      });

    return () => {
      customMaterial.dispose();
      globe
        .showAtmosphere(false)
        .polygonCapColor(() => '')
        .polygonSideColor(() => '')
        .polygonStrokeColor(() => '')
        .polygonsData([]);
    };
  }, [globe, customMaterial]);

  return null;
};

export default SciFiGlobeContent;
