import React, { useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Uniform, Color, ShaderMaterial, SphereGeometry, BackSide, Mesh, type Material } from 'three';
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
  twilightColor: '#6a2e18'
};

// Axe Y fixe pour la rotation (réutilisé chaque frame, pas de réallocation)
const Y_AXIS = new Vector3(0, 1, 0);

const RealisticGlobeContent: React.FC<Props> = ({ globe }) => {
  const textures = useEarthTextures();

  // Direction solaire en espace géographique local (avant rotation du groupe globe).
  // Mise à jour par SunCalc toutes les minutes via useRealSunDirection.
  const sunDirection = useMemo(() => new Vector3(0, 0, 1), []);

  // Vecteur de travail réutilisé chaque frame pour éviter les allocations
  const rotatedSun = useMemo(() => new Vector3(), []);

  const uniforms = useMemo(
    () => ({
      uDayTexture: new Uniform(textures.earthDayTexture),
      uNightTexture: new Uniform(textures.earthNightTexture),
      uSpecularCloudsTexture: new Uniform(textures.specularCloudsTexture),
      uSunDirection: new Uniform(new Vector3(0, 0, 1)),
      uAtmosphereDayColor: new Uniform(new Color(atmosphereParams.dayColor)),
      uAtmospherTwilightColor: new Uniform(new Color(atmosphereParams.twilightColor))
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textures]
  );

  const material = useMemo(
    () => new ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms
    }),
    [uniforms]
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDirection: new Uniform(new Vector3(0, 0, 1)),
      uAtmosphereDayColor: new Uniform(new Color(atmosphereParams.dayColor)),
      uAtmospherTwilightColor: new Uniform(new Color(atmosphereParams.twilightColor))
    }),
    []
  );

  const atmosphereGeometry = useMemo(() => new SphereGeometry(100, 64, 64), []);
  const atmosphereMaterial = useMemo(
    () => new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: atmosphereUniforms,
      side: BackSide,
      transparent: true
    }),
    [atmosphereUniforms]
  );

  const atmosphere = useMemo(() => {
    const mesh = new Mesh(atmosphereGeometry, atmosphereMaterial);
    mesh.scale.set(1.04, 1.04, 1.04);
    return mesh;
  }, [atmosphereGeometry, atmosphereMaterial]);

  // SunCalc met à jour sunDirection (espace géographique) toutes les minutes.
  // Le callback vide est intentionnel : c'est useFrame qui pousse vers les uniforms.
  const noop = useCallback(() => {}, []);
  useRealSunDirection(sunDirection, noop);

  // ☀️ Chaque frame : convertit sunDirection (espace géographique) → espace monde
  // en appliquant la même rotation Y que le groupe globe.
  // Ainsi uSunDirection et vNormal sont tous les deux en espace monde → dot correct.
  useFrame(() => {
    if (!globe.parent) return;
    rotatedSun
      .copy(sunDirection)
      .applyAxisAngle(Y_AXIS, globe.parent.rotation.y);
    uniforms.uSunDirection.value.copy(rotatedSun);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(rotatedSun);
  });

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

    return () => {
      globe.remove(atmosphere);
      atmosphere.geometry.dispose();
      (atmosphere.material as Material).dispose();
    };
  }, [globe, material, atmosphere]);

  return null;
};

export default RealisticGlobeContent;
