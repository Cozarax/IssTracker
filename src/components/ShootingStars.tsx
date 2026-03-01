import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── configuration ──────────────────────────────────────────────────────────
const POOL_SIZE    = 5;   // étoiles filantes simultanées max
const TRAIL_POINTS = 28;  // points dans la traîne
const SPHERE_R     = 175; // rayon de la sphère sur laquelle elles apparaissent
const SPAWN_MIN    = 1.8; // secondes min entre deux apparitions
const SPAWN_MAX    = 7.0; // secondes max entre deux apparitions

// Vecteurs statiques pour le spawning (hors frame)
const _n  = new THREE.Vector3();
const _t1 = new THREE.Vector3();
const _t2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _rt = new THREE.Vector3(1, 0, 0);

// Vecteurs statiques pour la mise à jour frame (zéro allocation)
const _head = new THREE.Vector3();

// ── helpers ─────────────────────────────────────────────────────────────────

function spawnOnSphere(r: number, out: THREE.Vector3) {
  const phi   = Math.acos(1 - 2 * Math.random());
  const theta = Math.random() * Math.PI * 2;
  out.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}

/** Direction aléatoire tangente à la sphère en `pos` — l'étoile passe "devant" le spectateur */
function tangentDir(pos: THREE.Vector3, out: THREE.Vector3) {
  _n.copy(pos).normalize();
  const ref = Math.abs(_n.y) < 0.85 ? _up : _rt;
  _t1.crossVectors(_n, ref).normalize();
  _t2.crossVectors(_n, _t1).normalize();
  const a = Math.random() * Math.PI * 2;
  out.set(
    _t1.x * Math.cos(a) + _t2.x * Math.sin(a),
    _t1.y * Math.cos(a) + _t2.y * Math.sin(a),
    _t1.z * Math.cos(a) + _t2.z * Math.sin(a)
  ).normalize();
}

// ── types ────────────────────────────────────────────────────────────────────

interface Star {
  line:        THREE.Line;
  active:      boolean;
  startPos:    THREE.Vector3;
  dir:         THREE.Vector3;
  progress:    number; // 0 → 1
  duration:    number; // secondes
  totalDist:   number; // distance totale parcourue
  trailLength: number; // longueur de la traîne
}

// ── composant ────────────────────────────────────────────────────────────────

export default function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null!);

  const pool = useMemo<Star[]>(() => {
    return Array.from({ length: POOL_SIZE }, () => {
      const positions = new Float32Array(TRAIL_POINTS * 3);
      const colors    = new Float32Array(TRAIL_POINTS * 3);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

      const mat  = new THREE.LineBasicMaterial({ vertexColors: true });
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      line.frustumCulled = false; // toujours rendu, la sphère est grande

      return {
        line,
        active:      false,
        startPos:    new THREE.Vector3(),
        dir:         new THREE.Vector3(),
        progress:    0,
        duration:    1,
        totalDist:   0,
        trailLength: 10,
      };
    });
  }, []);

  // Attache / détache les lignes au groupe Three.js
  useEffect(() => {
    const g = groupRef.current;
    pool.forEach(s => g.add(s.line));
    return () => {
      pool.forEach(s => {
        g.remove(s.line);
        s.line.geometry.dispose();
        (s.line.material as THREE.Material).dispose();
      });
    };
  }, [pool]);

  const nextSpawn = useRef(SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN));

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    // ── spawn ────────────────────────────────────────────────────────────────
    if (elapsed >= nextSpawn.current) {
      const slot = pool.find(s => !s.active);
      if (slot) {
        spawnOnSphere(SPHERE_R, slot.startPos);
        tangentDir(slot.startPos, slot.dir);
        slot.progress    = 0;
        slot.duration    = 0.55 + Math.random() * 0.75;
        slot.totalDist   = 18  + Math.random() * 22;
        slot.trailLength = 7   + Math.random() * 14;
        slot.active      = true;
        slot.line.visible = true;
      }
      nextSpawn.current = elapsed + SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    }

    // ── update ───────────────────────────────────────────────────────────────
    for (const star of pool) {
      if (!star.active) continue;

      star.progress += delta / star.duration;

      if (star.progress >= 1) {
        star.active = false;
        star.line.visible = false;
        continue;
      }

      // Position de la tête
      const headDist = star.progress * star.totalDist;
      _head.copy(star.startPos)
           .addScaledVector(star.dir, headDist);

      const posArr = star.line.geometry.attributes.position.array as Float32Array;
      const colArr = star.line.geometry.attributes.color.array    as Float32Array;

      // Enveloppe globale : fade-in rapide, fade-out progressif
      const env = Math.pow(Math.sin(star.progress * Math.PI), 0.6);

      for (let i = 0; i < TRAIL_POINTS; i++) {
        // t=0 → queue (loin de la tête) | t=1 → tête
        const t      = i / (TRAIL_POINTS - 1);
        const offset = (1 - t) * star.trailLength;

        posArr[i * 3]     = _head.x - star.dir.x * offset;
        posArr[i * 3 + 1] = _head.y - star.dir.y * offset;
        posArr[i * 3 + 2] = _head.z - star.dir.z * offset;

        // Couleur : blanc-bleuté à la tête, s'estompe vers la queue
        const bright = t * t * env;          // quadratique → traîne fine
        colArr[i * 3]     = bright * 0.92;   // R
        colArr[i * 3 + 1] = bright * 0.95;   // G
        colArr[i * 3 + 2] = bright;          // B légèrement dominant → bleu-blanc
      }

      star.line.geometry.attributes.position.needsUpdate = true;
      star.line.geometry.attributes.color.needsUpdate    = true;
    }
  });

  return <group ref={groupRef} />;
}
