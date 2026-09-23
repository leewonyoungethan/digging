import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { DirtCore } from './DirtCore';

const RING_COUNT = 12;
const RING_SPACING = 3.2;

function TunnelRings() {
  const depth = useGameStore((s) => s.depth);
  const groupRef = useRef<THREE.Group>(null);
  const offset = (depth * 0.06) % RING_SPACING;

  const rings = useMemo(() => Array.from({ length: RING_COUNT }, (_, i) => i), []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = offset;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((i) => {
        const z = -(i * RING_SPACING);
        const t = i / RING_COUNT;
        const color = new THREE.Color().setHSL(0.08 - t * 0.02, 0.55, 0.32 - t * 0.18);
        return (
          <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.4, 0.18, 8, 24]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function DepthFog() {
  const depth = useGameStore((s) => s.depth);
  useFrame(({ scene }) => {
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      const t = Math.min(depth / 500, 1);
      fog.density = 0.035 + t * 0.05;
      fog.color.setHSL(0.07, 0.4, 0.18 - t * 0.1);
    }
    const bg = scene.background as THREE.Color | null;
    if (bg) {
      const t2 = Math.min(depth / 500, 1);
      bg.setHSL(0.07, 0.4, 0.16 - t2 * 0.1);
    }
  });
  return null;
}

export function DigScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.5], fov: 55 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color('#2b1d14');
        scene.fog = new THREE.FogExp2('#2b1d14', 0.035);
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 4]} intensity={40} color="#ffcf8a" />
      <pointLight position={[0, -2, -3]} intensity={10} color="#ff8844" />
      <DepthFog />
      <TunnelRings />
      <DirtCore />
    </Canvas>
  );
}
