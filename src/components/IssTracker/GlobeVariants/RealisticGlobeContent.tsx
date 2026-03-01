import React, { useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import useEarthTextures from '../Hooks/useEarthTextures';
import useGlobeGUI from '../Hooks/useGlobeGui';
import { useRealSunDirection } from '../Hooks/useRealSunDirection';
import earthVertexShader from '../shaders/earthShader/vertex.glsl';
import earthFragmentShader from '../shaders/earthShader/fragment.glsl';
import atmosphereVertexShader from '../shaders/atmosphereShader/vertex.glsl';
import atmosphereFragmentShader from '../shaders/atmosphereShader/fragment.glsl';

interface Props {
  globe: ThreeGlobe;
}

const atmosphereParams = {
  dayColor: '#1a6fa8',
  twilightColor: '#b03a10'
};

const RealisticGlobeContent: React.FC<Props> = ({ globe }) => {
  const textures = useEarthTextures();

  const sunDirection = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const uniforms = useMemo(
    () => ({
      uDayTexture: new THREE.Uniform(textures.earthDayTexture),
      uNightTexture: new THREE.Uniform(textures.earthNightTexture),
      uSpecularCloudsTexture: new THREE.Uniform(textures.specularCloudsTexture),
      uSunDirection: new THREE.Uniform(sunDirection.clone()),
      uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(atmosphereParams.dayColor)),
      uAtmospherTwilightColor: new THREE.Uniform(new THREE.Color(atmosphereParams.twilightColor))
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textures, sunDirection]
  );

  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms
    }),
    [uniforms]
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDirection: new THREE.Uniform(sunDirection.clone()),
      uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(atmosphereParams.dayColor)),
      uAtmospherTwilightColor: new THREE.Uniform(new THREE.Color(atmosphereParams.twilightColor))
    }),
    [sunDirection]
  );

  const atmosphereGeometry = useMemo(() => new THREE.SphereGeometry(100, 64, 64), []);
  const atmosphereMaterial = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: atmosphereUniforms,
      side: THREE.BackSide,
      transparent: true
    }),
    [atmosphereUniforms]
  );

  const atmosphere = useMemo(() => {
    const mesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    mesh.scale.set(1.04, 1.04, 1.04);
    return mesh;
  }, [atmosphereGeometry, atmosphereMaterial]);

  const updateSun = useCallback(() => {
    uniforms.uSunDirection.value.copy(sunDirection);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  }, [sunDirection, uniforms, atmosphereMaterial]);

  // ☀️ Position solaire réelle depuis suncalc, mise à jour toutes les minutes
  useRealSunDirection(sunDirection, updateSun);

  const atmosphereParameters = useMemo(() => ({
    atmosphereDayColor: atmosphereParams.dayColor,
    atmosphereTwilightColor: atmosphereParams.twilightColor
  }), []);

  // 🎛️ GUI (visible uniquement avec ?debug dans l'URL)
  useGlobeGUI({
    earthMaterial: material,
    atmosphereMaterial,
    atmosphereParameters,
  });

  // 🌍 Matériaux et atmosphère
  useEffect(() => {
    globe.globeMaterial(material);
    globe.add(atmosphere);

    updateSun();

    return () => {
      globe.remove(atmosphere);
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
    };
  }, [globe, material, atmosphere, updateSun]);

  return null;
};

export default RealisticGlobeContent;
