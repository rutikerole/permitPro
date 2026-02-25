'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ProjectTypeId, Answers } from '@/lib/assessment/types';

// ─── Color helpers ────────────────────────────────────────────────────────────

const USAGE_HEX: Record<string, string> = {
  wohnen:    '#F59E0B',
  gewerbe:   '#60A5FA',
  gemischt:  '#A78BFA',
  sonderbau: '#F87171',
};

function resolveHex(projectType: ProjectTypeId, answers: Answers): string {
  if (projectType === 'abbruch') return '#EF4444';
  const usage =
    projectType === 'nutzungsaenderung'
      ? String(answers.neueNutzung ?? answers.nutzungsart ?? '')
      : String(answers.nutzungsart ?? '');
  return USAGE_HEX[usage] ?? '#64748B';
}

function isResidentialUsage(projectType: ProjectTypeId, answers: Answers): boolean {
  if (projectType === 'abbruch') return false;
  const usage =
    projectType === 'nutzungsaenderung'
      ? String(answers.neueNutzung ?? answers.nutzungsart ?? '')
      : String(answers.nutzungsart ?? '');
  return usage === 'wohnen';
}

function computeDims(projectType: ProjectTypeId, answers: Answers) {
  const rawH = Number(
    projectType === 'neubau' ? answers.hoehe : (answers.bestandHoehe ?? answers.hoehe ?? 0),
  );
  const heightM = Math.max(rawH, 0);
  const visH = heightM > 0 ? Math.min(Math.max(heightM * 0.16, 0.4), 9) : 0.4;

  const bri = Number(answers.bri ?? answers.anbauBri ?? 0);
  let visW = 2.4;
  let visD = 2.0;
  if (bri > 0 && heightM > 0) {
    const footprint = Math.min(bri / Math.max(heightM, 1), 280);
    const side = Math.sqrt(footprint);
    visW = Math.min(Math.max(side * 0.15, 1.6), 5.5);
    visD = Math.min(Math.max(side * 0.12, 1.3), 4.5);
  }
  return { visH, visW, visD };
}

// ─── High-quality window canvas painter ──────────────────────────────────────

function paintWindows(canvas: HTMLCanvasElement, states: boolean[][], floors: number, cols: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const cellH = H / floors;
  const cellW = W / cols;

  // Facade — dark concrete
  ctx.fillStyle = '#070d1a';
  ctx.fillRect(0, 0, W, H);

  // Subtle horizontal concrete bands between floors
  ctx.strokeStyle = 'rgba(255,255,255,0.032)';
  ctx.lineWidth = 2.5;
  for (let f = 1; f < floors; f++) {
    ctx.beginPath();
    ctx.moveTo(0, f * cellH);
    ctx.lineTo(W, f * cellH);
    ctx.stroke();
  }

  const padX = 0.13;
  const padY = 0.15;
  const winW = cellW * (1 - padX * 2);
  const winH = cellH * (1 - padY * 2);

  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + cellW * padX;
      const y = f * cellH + cellH * padY;

      if (states[f][c]) {
        // Lit window — alternate warm amber / cool office blue
        const isWarm = (f + c) % 3 !== 0;

        // Outer bloom halo
        const halo = ctx.createRadialGradient(
          x + winW / 2, y + winH / 2, 0,
          x + winW / 2, y + winH / 2, Math.max(winW, winH) * 0.9,
        );
        if (isWarm) {
          halo.addColorStop(0,   'rgba(255,228,150,0.72)');
          halo.addColorStop(0.6, 'rgba(240,170,55,0.3)');
          halo.addColorStop(1,   'rgba(200,100,20,0)');
        } else {
          halo.addColorStop(0,   'rgba(190,220,255,0.65)');
          halo.addColorStop(0.6, 'rgba(100,172,255,0.28)');
          halo.addColorStop(1,   'rgba(50,120,220,0)');
        }
        ctx.fillStyle = halo;
        ctx.fillRect(x - 7, y - 7, winW + 14, winH + 14);

        // Glass pane
        ctx.fillStyle = isWarm ? 'rgba(255,232,162,0.92)' : 'rgba(188,222,255,0.9)';
        ctx.fillRect(x, y, winW, winH);

        // Window cross-frame
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + winW / 2, y); ctx.lineTo(x + winW / 2, y + winH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + winH * 0.52); ctx.lineTo(x + winW, y + winH * 0.52);
        ctx.stroke();

        // Top-left glare
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + 1.5, y + 1.5, winW * 0.17, winH * 0.40);
      } else {
        // Dark window — moonlight sky reflection
        ctx.fillStyle = 'rgba(7,13,26,0.97)';
        ctx.fillRect(x, y, winW, winH);

        // Subtle sky gradient top of glass
        const skyGrd = ctx.createLinearGradient(x, y, x, y + winH * 0.42);
        skyGrd.addColorStop(0, 'rgba(28,58,110,0.26)');
        skyGrd.addColorStop(1, 'rgba(14,28,58,0)');
        ctx.fillStyle = skyGrd;
        ctx.fillRect(x, y, winW, winH * 0.42);

        // Window frame outline
        ctx.strokeStyle = 'rgba(38,78,140,0.17)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, winW, winH);
      }
    }
  }
}

// ─── Animated window texture ──────────────────────────────────────────────────

function useAnimatedWindowTexture(floors: number, cols: number): THREE.CanvasTexture | null {
  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const statesRef     = useRef<boolean[][]>([]);
  const lastFlickerRef = useRef(-10);

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const fl = Math.max(floors, 1);
    const cl = Math.max(cols, 1);

    const canvas = document.createElement('canvas');
    canvas.width  = 512;
    canvas.height = 1024;
    canvasRef.current = canvas;

    statesRef.current = Array.from({ length: fl }, () =>
      Array.from({ length: cl }, () => Math.random() > 0.18),
    );

    const tex = new THREE.CanvasTexture(canvas);
    paintWindows(canvas, statesRef.current, fl, cl);
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors, cols]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (elapsed - lastFlickerRef.current < 2.8 + Math.random() * 2) return;
    lastFlickerRef.current = elapsed;

    const canvas = canvasRef.current;
    const states = statesRef.current;
    if (!canvas || !states.length || !texture) return;

    const fl = states.length;
    const cl = states[0]?.length ?? 1;
    const n  = 1 + (Math.random() > 0.6 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const f = Math.floor(Math.random() * fl);
      const c = Math.floor(Math.random() * cl);
      states[f][c] = !states[f][c];
    }
    paintWindows(canvas, states, fl, cl);
    texture.needsUpdate = true;
  });

  return texture;
}

// ─── Gable roof (residential / Wohnen) ───────────────────────────────────────

function GableRoof({ width, depth, y, hex }: { width: number; depth: number; y: number; hex: string }) {
  const geo = useMemo(() => {
    const pitch = Math.min(width * 0.52, 1.3);
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(0, pitch);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [width, depth]);

  const tileColor = useMemo(() => new THREE.Color(hex).multiplyScalar(0.38), [hex]);
  const ridgeHex  = useMemo(() => new THREE.Color(hex).multiplyScalar(0.7),  [hex]);

  return (
    <group position={[0, y, 0]}>
      {/* Roof planes */}
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={tileColor} roughness={0.84} metalness={0.12} />
      </mesh>
      {/* Ridge beam */}
      <mesh position={[0, Math.min(width * 0.52, 1.3) - 0.025, 0]}>
        <boxGeometry args={[0.065, 0.05, depth + 0.06]} />
        <meshStandardMaterial color={ridgeHex} roughness={0.25} metalness={0.82} emissive={ridgeHex} emissiveIntensity={0.06} />
      </mesh>
    </group>
  );
}

// ─── Flat rooftop with equipment (commercial) ────────────────────────────────

function FlatRoofTop({ width, depth, y, hex }: { width: number; depth: number; y: number; hex: string }) {
  const parapetColor = useMemo(() => new THREE.Color(hex), [hex]);
  return (
    <group position={[0, y, 0]}>
      {/* Parapet */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.07, 0.09, depth + 0.07]} />
        <meshStandardMaterial color={parapetColor} roughness={0.15} metalness={0.88} emissive={parapetColor} emissiveIntensity={0.06} />
      </mesh>
      {/* HVAC unit A */}
      <mesh position={[width * 0.19, 0.15, depth * 0.09]} castShadow>
        <boxGeometry args={[width * 0.32, 0.26, depth * 0.26]} />
        <meshStandardMaterial color="#151f2e" roughness={0.72} metalness={0.58} />
      </mesh>
      {/* HVAC unit B (smaller) */}
      <mesh position={[-width * 0.22, 0.12, -depth * 0.14]} castShadow>
        <boxGeometry args={[width * 0.19, 0.2, depth * 0.17]} />
        <meshStandardMaterial color="#151f2e" roughness={0.72} metalness={0.58} />
      </mesh>
      {/* Antenna mast */}
      <mesh position={[width * 0.06, 0.48, depth * 0.04]}>
        <cylinderGeometry args={[0.016, 0.016, 0.82, 6]} />
        <meshStandardMaterial color="#6B7280" roughness={0.38} metalness={0.92} />
      </mesh>
      {/* Antenna warning light */}
      <mesh position={[width * 0.06, 0.9, depth * 0.04]}>
        <sphereGeometry args={[0.034, 8, 8]} />
        <meshStandardMaterial color="#ff3030" emissive="#ff2020" emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}

// ─── Construction crane (Neubau) ─────────────────────────────────────────────

function ConstructionCrane({ buildingH }: { buildingH: number }) {
  const mH = buildingH + 2.4;
  return (
    <group position={[-0.1, 0, -0.05]}>
      {/* Mast */}
      <mesh position={[0, mH / 2, 0]} castShadow>
        <boxGeometry args={[0.072, mH, 0.072]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.52} metalness={0.62} emissive="#F59E0B" emissiveIntensity={0.14} />
      </mesh>
      {/* Cab */}
      <mesh position={[0, mH - 0.14, 0]}>
        <boxGeometry args={[0.24, 0.24, 0.2]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.5} metalness={0.55} />
      </mesh>
      {/* Main jib */}
      <mesh position={[1.9, mH, 0]} castShadow>
        <boxGeometry args={[3.8, 0.058, 0.058]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.52} metalness={0.62} emissive="#F59E0B" emissiveIntensity={0.12} />
      </mesh>
      {/* Counter jib */}
      <mesh position={[-0.72, mH, 0]}>
        <boxGeometry args={[1.44, 0.058, 0.058]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.52} metalness={0.62} />
      </mesh>
      {/* Counterweight */}
      <mesh position={[-1.38, mH - 0.2, 0]}>
        <boxGeometry args={[0.4, 0.34, 0.24]} />
        <meshStandardMaterial color="#374151" roughness={0.88} metalness={0.28} />
      </mesh>
      {/* Hook cable */}
      <mesh position={[3.15, mH - 0.95, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.9, 4]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.38} metalness={0.88} />
      </mesh>
      {/* Hook */}
      <mesh position={[3.15, mH - 1.95, 0]}>
        <boxGeometry args={[0.14, 0.14, 0.1]} />
        <meshStandardMaterial color="#6B7280" roughness={0.32} metalness={0.94} />
      </mesh>
    </group>
  );
}

// ─── Rubble / debris (Abbruch) ────────────────────────────────────────────────

function Rubble({ scale }: { scale: number }) {
  const chunks = useMemo(() => {
    const rng = (a: number, b: number) => a + Math.random() * (b - a);
    const s = scale;
    return Array.from({ length: 32 }, (_, i) => ({
      key:  i,
      pos:  [rng(-s * 0.72, s * 0.72), rng(0, 0.22), rng(-s * 0.62, s * 0.62)] as [number, number, number],
      rot:  [rng(0, Math.PI), rng(0, Math.PI), rng(0, Math.PI)] as [number, number, number],
      size: rng(0.06, 0.3),
      tone: i % 4,
    }));
  }, [scale]);

  const COLORS = ['#1c2530', '#232f3e', '#2d3748', '#3a4a5c'];

  return (
    <>
      {chunks.map(({ key, pos, rot, size, tone }) => (
        <mesh key={key} position={pos} rotation={rot} castShadow>
          <boxGeometry args={[size, size * 0.52, size * 0.87]} />
          <meshStandardMaterial color={COLORS[tone]} roughness={0.96} metalness={0.04} />
        </mesh>
      ))}
    </>
  );
}

// ─── Neighbour silhouettes ────────────────────────────────────────────────────

function NeighborBuildings({ mainW, mainH }: { mainW: number; mainH: number }) {
  return (
    <>
      <mesh position={[-(mainW + 1.3), (mainH * 0.82) / 2, 0.12]} castShadow>
        <boxGeometry args={[1.85, mainH * 0.82, 1.75]} />
        <meshStandardMaterial color="#0f1d2d" roughness={0.9} metalness={0.22} emissive="#0a1828" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[mainW + 1.3, (mainH * 1.12) / 2, -0.12]} castShadow>
        <boxGeometry args={[2.05, mainH * 1.12, 1.92]} />
        <meshStandardMaterial color="#0f1d2d" roughness={0.9} metalness={0.22} emissive="#0a1828" emissiveIntensity={0.55} />
      </mesh>
    </>
  );
}

// ─── Existing wing (Anbau) ────────────────────────────────────────────────────

function ExistingWing({ mainW, mainH, mainD }: { mainW: number; mainH: number; mainD: number }) {
  const wingW = mainW * 0.62;
  return (
    <mesh position={[-(mainW * 0.5 + wingW * 0.5 + 0.06), mainH / 2, 0]} castShadow>
      <boxGeometry args={[wingW, mainH, mainD * 0.88]} />
      <meshStandardMaterial color="#101c2c" roughness={0.72} metalness={0.45} emissive="#0a1828" emissiveIntensity={0.48} />
    </mesh>
  );
}

// ─── Main building body ───────────────────────────────────────────────────────

interface BodyProps {
  targetH:          number;
  targetW:          number;
  targetD:          number;
  hex:              string;
  rotZ?:            number;
  emissiveIntensity?: number;
  wireframe?:       boolean;
  opacity?:         number;
  residential?:     boolean;
}

function BuildingBody({
  targetH, targetW, targetD, hex,
  rotZ = 0, emissiveIntensity = 0.07,
  wireframe = false, opacity = 1, residential = false,
}: BodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null);
  const roofRef  = useRef<THREE.Group>(null);

  const tH   = useRef(targetH);
  const tW   = useRef(targetW);
  const tD   = useRef(targetD);
  const tCol = useRef(new THREE.Color(hex));

  useEffect(() => { tH.current = targetH; }, [targetH]);
  useEffect(() => { tW.current = targetW; }, [targetW]);
  useEffect(() => { tD.current = targetD; }, [targetD]);
  useEffect(() => { tCol.current.set(hex); }, [hex]);

  const floors  = Math.max(Math.floor(targetH / 0.45), 1);
  const cols    = Math.max(Math.floor(targetW / 0.55), 2);
  const faceTex = useAnimatedWindowTexture(floors, cols);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.scale.x  += (tW.current - g.scale.x)  * 0.07;
    g.scale.y  += (tH.current - g.scale.y)  * 0.07;
    g.scale.z  += (tD.current - g.scale.z)  * 0.07;
    g.position.y += (tH.current / 2 - g.position.y) * 0.07;

    // Roof tracks building top
    if (roofRef.current) {
      roofRef.current.position.y += ((g.position.y + g.scale.y * 0.5) - roofRef.current.position.y) * 0.07;
    }

    if (matRef.current) {
      matRef.current.color.lerp(tCol.current, 0.04);
      if (!wireframe) matRef.current.emissive.lerp(tCol.current, 0.04);
    }
  });

  const bodyColor = new THREE.Color(hex).multiplyScalar(0.19);

  return (
    <group>
      {/* Base plinth */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[targetW + 0.2, 0.14, targetD + 0.2]} />
        <meshStandardMaterial color="#0a1322" roughness={0.87} metalness={0.24} />
      </mesh>

      {/* Main body */}
      <group
        ref={groupRef}
        position={[0, targetH / 2, 0]}
        scale={[targetW, targetH, targetD]}
        rotation={[0, 0, rotZ]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            ref={matRef}
            color={wireframe ? hex : bodyColor}
            emissive={wireframe ? undefined : bodyColor}
            emissiveIntensity={wireframe ? 0 : emissiveIntensity}
            roughness={0.28}
            metalness={0.72}
            transparent={opacity < 1}
            opacity={opacity}
            wireframe={wireframe}
          />
        </mesh>

        {/* Window facades — all 4 sides, emissiveMap enables bloom glow */}
        {!wireframe && faceTex && (
          <>
            <mesh position={[0, 0, 0.502]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={faceTex} emissiveMap={faceTex} emissive="white" emissiveIntensity={0.55} transparent opacity={opacity * 0.97} roughness={0.05} metalness={0.28} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0, -0.502]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={faceTex} emissiveMap={faceTex} emissive="white" emissiveIntensity={0.28} transparent opacity={opacity * 0.58} roughness={0.05} metalness={0.28} depthWrite={false} />
            </mesh>
            <mesh position={[-0.502, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={faceTex} emissiveMap={faceTex} emissive="white" emissiveIntensity={0.18} transparent opacity={opacity * 0.44} roughness={0.05} metalness={0.28} depthWrite={false} />
            </mesh>
            <mesh position={[0.502, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={faceTex} emissiveMap={faceTex} emissive="white" emissiveIntensity={0.18} transparent opacity={opacity * 0.44} roughness={0.05} metalness={0.28} depthWrite={false} />
            </mesh>
          </>
        )}
      </group>

      {/* Wireframe accent overlay (Umbau) */}
      {wireframe && (
        <mesh position={[0, targetH / 2, 0]} scale={[targetW + 0.07, targetH + 0.07, targetD + 0.07]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hex} wireframe emissive={hex} emissiveIntensity={0.48} />
        </mesh>
      )}

      {/* Floor ledge bands */}
      {!wireframe && Array.from({ length: Math.max(floors - 1, 0) }, (_, i) => {
        const bandY = ((i + 1) / floors) * targetH;
        return (
          <mesh key={i} position={[0, bandY, 0]} castShadow>
            <boxGeometry args={[targetW + 0.055, 0.048, targetD + 0.055]} />
            <meshStandardMaterial color={hex} roughness={0.18} metalness={0.88} emissive={hex} emissiveIntensity={0.05} />
          </mesh>
        );
      })}

      {/* Ground accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[Math.max(targetW, targetD) * 0.84, Math.max(targetW, targetD) * 0.93, 48]} />
        <meshStandardMaterial color={hex} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Roof — tracked group so it follows the animated building height */}
      {!wireframe && (
        <group ref={roofRef} position={[0, targetH, 0]}>
          {residential
            ? <GableRoof width={targetW} depth={targetD} y={0} hex={hex} />
            : <FlatRoofTop width={targetW} depth={targetD} y={0} hex={hex} />
          }
        </group>
      )}
    </group>
  );
}

// ─── Exported BuildingMesh ────────────────────────────────────────────────────

export interface BuildingMeshProps {
  projectType: ProjectTypeId;
  answers:     Answers;
}

export function BuildingMesh({ projectType, answers }: BuildingMeshProps) {
  const { visH, visW, visD } = computeDims(projectType, answers);
  const hex        = resolveHex(projectType, answers);
  const residential = isResidentialUsage(projectType, answers);

  return (
    <group>
      {/* Neighbour silhouettes (when not free-standing) */}
      {answers.freistehend === false && projectType !== 'anbau' && (
        <NeighborBuildings mainW={visW} mainH={visH} />
      )}

      {/* Existing wing (Anbau) */}
      {projectType === 'anbau' && (
        <ExistingWing mainW={visW} mainH={visH} mainD={visD} />
      )}

      {/* Construction crane (Neubau) */}
      {projectType === 'neubau' && (
        <ConstructionCrane buildingH={visH} />
      )}

      {/* Main building */}
      <BuildingBody
        targetH={visH}
        targetW={visW}
        targetD={visD}
        hex={hex}
        rotZ={projectType === 'abbruch' ? -0.07 : 0}
        emissiveIntensity={projectType === 'abbruch' ? 0.22 : 0.07}
        wireframe={projectType === 'umbau'}
        opacity={projectType === 'umbau' ? 0.72 : 1}
        residential={residential}
      />

      {/* Rubble (Abbruch) */}
      {projectType === 'abbruch' && <Rubble scale={Math.max(visW, visD)} />}
    </group>
  );
}
