'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, MeshReflectorMaterial, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { BuildingMesh, type BuildingMeshProps } from './building-mesh';

// ─── Dual-layer particle field ────────────────────────────────────────────────

interface ParticleLayerProps {
  color: string;
  count: number;
  spread: number;
  speed: number;
  size: number;
  baseOpacity: number;
}

function ParticleLayer({ color, count, spread, speed, size, baseOpacity }: ParticleLayerProps) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = Math.random() * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * speed;
    (ref.current.material as THREE.PointsMaterial).opacity =
      baseOpacity + Math.sin(clock.getElapsedTime() * 0.65) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={baseOpacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── City skyline silhouettes ─────────────────────────────────────────────────

function CitySkyline() {
  const buildings = useMemo(() => {
    const rng = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: 34 }, (_, i) => {
      const angle = (i / 34) * Math.PI * 2 + rng(-0.04, 0.04);
      const r     = 13.5 + rng(-1.5, 3.5);
      return {
        x:   Math.cos(angle) * r,
        z:   Math.sin(angle) * r,
        h:   rng(1.2, 9.0),
        w:   rng(0.5, 2.4),
        d:   rng(0.5, 1.7),
        lit: Math.random() > 0.55,
      };
    });
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color="#090f1c"
            roughness={1}
            metalness={0}
            emissive={b.lit ? '#0c1e3a' : '#000000'}
            emissiveIntensity={b.lit ? 1.2 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Slowly orbiting accent light ─────────────────────────────────────────────

function OrbitLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.21;
    ref.current.position.set(
      Math.cos(t) * 8.5,
      3.5 + Math.sin(t * 0.55) * 1.2,
      Math.sin(t) * 8.5,
    );
  });
  return <pointLight ref={ref} intensity={1.8} color="#22d3ee" distance={20} decay={2} />;
}

// ─── Double ground rings ──────────────────────────────────────────────────────

function GroundRings() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.045 + Math.sin(t * 1.05) * 0.025;
      const s = 1 + Math.sin(t * 1.05) * 0.03;
      outerRef.current.scale.set(s, 1, s);
    }
    if (innerRef.current) {
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(t * 1.9 + 1.2) * 0.055;
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
      <mesh ref={outerRef}>
        <ringGeometry args={[3.6, 4.5, 64]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.045} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={innerRef}>
        <ringGeometry args={[1.5, 1.9, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────

function SceneContent(props: BuildingMeshProps) {
  return (
    <>
      <color attach="background" args={['#040a14']} />
      <fog attach="fog" args={['#060c18', 22, 46]} />

      {/* Stars */}
      <Stars radius={80} depth={60} count={2400} factor={5} saturation={0.12} fade speed={0.4} />

      {/* Lighting */}
      <hemisphereLight args={['#1a3a6a', '#040810', 0.6]} />
      <ambientLight intensity={0.12} color="#0a1628" />
      <directionalLight
        position={[6, 12, 7]}
        intensity={2.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-7, 5, -6]} intensity={0.75} color="#4466ff" />
      <pointLight position={[0, 7, 6]}   intensity={3.5}  color="#f59e0b" distance={26} decay={2} />
      <pointLight position={[0, 0.4, 0]} intensity={0.65} color="#f59e0b" distance={7}  decay={1} />
      <pointLight position={[6, 3, -4]}  intensity={1.1}  color="#22d3ee" distance={16} decay={2} />
      <OrbitLight />

      {/* Reflective ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial
          blur={[400, 150]}
          resolution={512}
          mixBlur={1.1}
          mixStrength={28}
          roughness={0.95}
          depthScale={1.4}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#040a14"
          metalness={0.65}
          mirror={0}
        />
      </mesh>

      {/* Shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial transparent opacity={0.55} />
      </mesh>

      {/* FX */}
      <ParticleLayer color="#f59e0b" count={220} spread={26} speed={0.021}  size={0.043} baseOpacity={0.28} />
      <ParticleLayer color="#38bdf8" count={90}  spread={18} speed={-0.014} size={0.028} baseOpacity={0.18} />
      <GroundRings />
      <CitySkyline />

      {/* Building */}
      <Suspense fallback={null}>
        <Float speed={0.9} rotationIntensity={0.1} floatIntensity={0.38} floatingRange={[-0.04, 0.04]}>
          <BuildingMesh {...props} />
        </Float>
      </Suspense>

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.75}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.3}
        target={[0, 2, 0]}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.16} luminanceSmoothing={0.88} intensity={0.95} mipmapBlur />
        <Vignette eskil={false} offset={0.28} darkness={0.68} />
      </EffectComposer>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function BuildingScene(props: BuildingMeshProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8, 5, 8], fov: 40, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
