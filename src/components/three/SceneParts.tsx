import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S, mouse, PALETTE } from "@/lib/story";
import type { Quality } from "./SerumBottle";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Glass({ quality, color, thickness = 0.6, attenuation }: { quality: Quality; color: string; thickness?: number; attenuation?: string }) {
  if (quality === "low") {
    return <meshPhysicalMaterial color={color} transparent opacity={0.6} roughness={0.08} clearcoat={1} envMapIntensity={1.6} />;
  }
  return (
    <meshPhysicalMaterial
      color={color}
      transmission={1}
      thickness={thickness}
      roughness={0.04}
      ior={1.42}
      clearcoat={1}
      attenuationColor={attenuation ?? color}
      attenuationDistance={1.2}
      envMapIntensity={1.4}
    />
  );
}

/* ---------------- Ingredients ---------------- */

// World positions along the camera's forward travel: the camera dollies from z≈9
// to z≈1.4 and passes Vitamin C, then Niacinamide, then Hyaluronic Acid.
// Index order matches the JSX children: HA, Vitamin C, Niacinamide, Peptides.
const ING_POS: [number, number, number][] = [
  [0.75, 0.15, 0.6],
  [0.95, 0.35, 4.4],
  [-0.9, -0.15, 2.7],
  [-0.85, 0.35, -1.6],
];
const ING_ORDER = [2, 0, 1, 3];

function Hyaluronic({ quality }: { quality: Quality }) {
  const blobs: [number, number, number, number][] = [
    [0, 0, 0, 0.22],
    [0.26, 0.14, 0.05, 0.12],
    [-0.2, 0.2, -0.08, 0.1],
    [0.12, -0.24, 0.1, 0.09],
    [-0.24, -0.12, 0.12, 0.07],
    [0.05, 0.32, -0.1, 0.06],
  ];
  return (
    <group>
      {blobs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 32, 32]} />
          <Glass quality={quality} color="#eef1ee" attenuation="#d9e4e6" thickness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function VitaminC({ quality }: { quality: Quality }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.3, 48, 48]} />
        <Glass quality={quality} color="#f2b46b" attenuation="#e07b2c" thickness={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#f6c27a" emissive="#e8913b" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function Niacinamide({ quality }: { quality: Quality }) {
  const atoms = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0);
    }),
    [],
  );
  const bonds = useMemo(
    () =>
      atoms.map((a, i) => {
        const b = atoms[(i + 1) % atoms.length]!;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        return { mid, len: dir.length(), q };
      }),
    [atoms],
  );
  return (
    <group>
      {atoms.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <Glass quality={quality} color={PALETTE.skin} thickness={0.2} />
        </mesh>
      ))}
      {bonds.map((b, i) => (
        <mesh key={`b${i}`} position={b.mid} quaternion={b.q}>
          <cylinderGeometry args={[0.014, 0.014, b.len, 8]} />
          <meshStandardMaterial color={PALETTE.champagne} metalness={1} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0.46, 0.0, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <Glass quality={quality} color="#f4ece2" thickness={0.25} />
      </mesh>
      <mesh position={[0.36, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.014, 0.014, 0.12, 8]} />
        <meshStandardMaterial color={PALETTE.champagne} metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Peptides() {
  const beads = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        const a = t * Math.PI * 4;
        return { p: new THREE.Vector3(Math.cos(a) * 0.16, (t - 0.5) * 0.9, Math.sin(a) * 0.16), plum: i % 3 === 0 };
      }),
    [],
  );
  return (
    <group>
      {beads.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[0.055, 20, 20]} />
          <meshPhysicalMaterial
            color={b.plum ? "#7a3a5c" : PALETTE.skin}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.1}
            sheen={1}
            sheenColor={PALETTE.champagne}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Ingredients({ quality }: { quality: Quality }) {
  const root = useRef<THREE.Group>(null);
  const items = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    r.visible = S.ingredients > 0.001;
    if (!r.visible) return;
    items.current.forEach((g, i) => {
      if (!g) return;
      const e = easeOut(clamp01(S.ingredients - ING_ORDER[i]!));
      g.scale.setScalar(Math.max(e, 0.0001));
      const p = ING_POS[i]!;
      g.position.set(p[0] * (1 + (1 - e) * 0.8), p[1] + (1 - e) * 0.4 + mouse.sy * 0.04, p[2]);
      g.rotation.set(S.orbit * 0.5 + i, S.orbit * 0.9 + i * 1.7, 0);
    });
  });

  return (
    <group ref={root}>
      <group ref={(g) => { items.current[0] = g; }}><Hyaluronic quality={quality} /></group>
      <group ref={(g) => { items.current[1] = g; }}><VitaminC quality={quality} /></group>
      <group ref={(g) => { items.current[2] = g; }}><Niacinamide quality={quality} /></group>
      <group ref={(g) => { items.current[3] = g; }}><Peptides /></group>
    </group>
  );
}

/* ---------------- Serum droplets (macro scene) ---------------- */

export function Droplets({ quality }: { quality: Quality }) {
  const root = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const drops = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: quality === "high" ? 16 : 9 }, () => ({
      p: [(r() - 0.5) * 2.2, 0.05 + r() * 1.3, 0.65 + r() * 1.2] as [number, number, number],
      s: 0.02 + r() * 0.042,
      depth: 0.4 + r() * 0.9,
      rot: (r() - 0.5) * 0.6,
    }));
  }, [quality]);

  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, quality === "high" ? 48 : 20, quality === "high" ? 32 : 14);
    const pos = g.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const taper = y > 0 ? 1 - y * 0.42 : 1 + y * 0.04;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
      pos.setY(i, y * (y > 0 ? 1.35 : 1));
    }
    g.computeVertexNormals();
    return g;
  }, [quality]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    r.visible = S.droplets > 0.001;
    if (!r.visible) return;
    r.position.set(S.bX, S.bY, S.bZ);
    drops.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      const t = easeOut(clamp01(S.droplets * 1.5 - i * 0.03));
      m.scale.setScalar(Math.max(d.s * t, 0.0001));
      m.position.set(
        d.p[0] + mouse.sx * 0.22 * d.depth,
        d.p[1] + mouse.sy * 0.16 * d.depth + (1 - t) * -0.3,
        d.p[2],
      );
      m.rotation.z = d.rot - mouse.sx * 0.25 * d.depth;
    });
  });

  return (
    <group ref={root}>
      {drops.map((_, i) => (
        <mesh key={i} geometry={geo} ref={(m) => { refs.current[i] = m; }}>
          {quality === "high" ? (
            <meshPhysicalMaterial
              color="#f7e6d6"
              transmission={1}
              thickness={0.5}
              roughness={0}
              ior={1.36}
              attenuationColor="#d9a27a"
              attenuationDistance={0.6}
              clearcoat={1}
              envMapIntensity={1.6}
            />
          ) : (
            <meshPhysicalMaterial color="#f1d6bf" transparent opacity={0.7} roughness={0} clearcoat={1} envMapIntensity={2} />
          )}
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Particles ---------------- */

export function Particles({ count }: { count: number }) {
  const pts = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const r = seeded(42);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const rad = 3 + r() * 5;
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      a[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = rad * Math.cos(ph) * 0.7;
      a[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th) - 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    if (pts.current) {
      pts.current.rotation.y = S.progress * 2.4;
      pts.current.rotation.x = S.progress * 0.5;
    }
    if (mat.current) mat.current.opacity = S.particles * (0.15 + 0.85 * S.intro);
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial ref={mat} size={0.022} color={PALETTE.champagne} transparent depthWrite={false} sizeAttenuation />
    </points>
  );
}
