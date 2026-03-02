import { useTexture } from '@react-three/drei';
import { type Texture, SRGBColorSpace } from 'three';

type EarthTextures = {
  earthDayTexture: Texture;
  earthNightTexture: Texture;
  specularCloudsTexture: Texture;
};

// useTexture suspend le composant jusqu'au chargement complet —
// plus besoin de gérer le cas null ni de dispose manuel.
const useEarthTextures = (): EarthTextures => {
  const [earthDayTexture, earthNightTexture, specularCloudsTexture] = useTexture([
    '/img/8k_earth_daymap.jpg',
    '/img/8k_earth_nightmap.jpg',
    '/img/specularClouds.jpg',
  ]);

  earthDayTexture.colorSpace = SRGBColorSpace;
  earthDayTexture.anisotropy = 8;
  earthNightTexture.colorSpace = SRGBColorSpace;
  earthNightTexture.anisotropy = 8;
  specularCloudsTexture.anisotropy = 8;

  return { earthDayTexture, earthNightTexture, specularCloudsTexture };
};

export default useEarthTextures;
