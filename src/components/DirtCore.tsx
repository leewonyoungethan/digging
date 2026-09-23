import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

const PARTICLE_COUNT = 16;

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

function createParticle(): ParticleData {
  return { position: new THREE.Vector3(), velocity: new THREE.Vector3(), life: 0 };
}

export function DirtCore() {
  const dig = useGameStore((s) => s.dig);
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const punch = useRef(0);
  const particles = useRef<ParticleData[]>(
    Array.from({ length: PARTICLE_COUNT }, createParticle),
  );
  const nextParticle = useRef(0);
  const dummy = useRef(new THREE.Object3D()).current;

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    dig();
    punch.current = 1;

    for (let i = 0; i < 6; i++) {
      const p = particles.current[nextParticle.current];
      nextParticle.current = (nextParticle.current + 1) % PARTICLE_COUNT;
      p.position.set(0, 0, 0.8);
      p.velocity.set(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 2.5 + 0.5,
        (Math.random() - 0.5) * 2 + 1.5,
      );
      p.life = 1;
    }
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      punch.current = Math.max(0, punch.current - delta * 6);
      const scale = 1 + punch.current * 0.18;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x += delta * 0.08;
    }

    if (particlesRef.current) {
      particles.current.forEach((p, i) => {
        if (p.life > 0) {
          p.life = Math.max(0, p.life - delta * 1.1);
          p.velocity.y -= delta * 4.5;
          p.position.addScaledVector(p.velocity, delta);
        }
        dummy.position.copy(p.position);
        const s = p.life * 0.18;
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        particlesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 보이지 않는 넉넉한 히트박스 — 회전하는 뾰족한 모서리를 정확히 맞추지 않아도 클릭되도록 */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[1.9, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial color="#8a5a34" roughness={0.85} flatShading />
      </mesh>
      <instancedMesh ref={particlesRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
