import * as THREE from 'three';
import { useEffect } from 'react';

interface UseGlobeGUIParams {
  earthMaterial: THREE.ShaderMaterial;
  atmosphereMaterial: THREE.ShaderMaterial;
  atmosphereParameters: {
    atmosphereDayColor: string;
    atmosphereTwilightColor: string;
  };
}

const isDebug =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');

const useGlobeGUI = ({
  earthMaterial,
  atmosphereMaterial,
  atmosphereParameters,
}: UseGlobeGUIParams) => {
  useEffect(() => {
    if (!isDebug) return;

    let gui: import('lil-gui').GUI;

    import('lil-gui').then(({ GUI }) => {
      gui = new GUI({ title: 'Globe debug' });

      gui.addColor(atmosphereParameters, 'atmosphereDayColor').onChange(() => {
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(atmosphereParameters.atmosphereDayColor);
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(atmosphereParameters.atmosphereDayColor);
      });

      gui.addColor(atmosphereParameters, 'atmosphereTwilightColor').onChange(() => {
        earthMaterial.uniforms.uAtmospherTwilightColor.value.set(atmosphereParameters.atmosphereTwilightColor);
        atmosphereMaterial.uniforms.uAtmospherTwilightColor.value.set(atmosphereParameters.atmosphereTwilightColor);
      });
    });

    return () => {
      gui?.destroy();
    };
  }, [earthMaterial, atmosphereMaterial, atmosphereParameters]);
};

export default useGlobeGUI;
