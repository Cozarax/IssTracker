import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;

  uniform float uTime;
  varying float vTwinkle;

  void main() {
    vTwinkle = 0.75 + 0.25 * sin(uTime * aSpeed + aPhase);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vTwinkle;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float core = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(1.0, 1.0, 1.0, core * vTwinkle);
  }
`;

const COUNT = 4000;

export default function Starfield() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const phases    = new Float32Array(COUNT);
    const speeds    = new Float32Array(COUNT);
    const sizes     = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 80 + Math.random() * 120;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.1 + Math.random() * 0.6;
      sizes[i]  = 0.8 + Math.random() * 2.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return <points geometry={geometry} material={material} />;
}
