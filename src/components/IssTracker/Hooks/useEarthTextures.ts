import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

type EarthTextures = {
  earthDayTexture:       THREE.Texture;
  earthNightTexture:     THREE.Texture;
  specularCloudsTexture: THREE.Texture;
};

// useTexture suspend le composant jusqu'au chargement complet —
// plus besoin de gérer le cas null ni de dispose manuel.
const useEarthTextures = (): EarthTextures => {
  const [earthDayTexture, earthNightTexture, specularCloudsTexture] = useTexture([
    '/img/8k_earth_daymap.jpg',
    '/img/8k_earth_nightmap.jpg',
    '/img/specularClouds.jpg',
  ]);

  earthDayTexture.colorSpace       = THREE.SRGBColorSpace;
  earthDayTexture.anisotropy       = 8;
  earthNightTexture.colorSpace     = THREE.SRGBColorSpace;
  earthNightTexture.anisotropy     = 8;
  specularCloudsTexture.anisotropy = 8;

  return { earthDayTexture, earthNightTexture, specularCloudsTexture };
};

export default useEarthTextures;
