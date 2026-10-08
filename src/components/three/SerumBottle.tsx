import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural placeholder serum bottle.
 * To swap in a real model later, replace the meshes inside each part group
 * (bulb / collar / pipette / glass / liquid / label) with nodes from
 * useGLTF("/models/serum.glb") — the explode choreography only moves the groups.
 */
export type Quality = "high" | "low";

const GLASS_PROFILE: [number, number][] = [
  [0, 0],
  [0.48, 0],
  [0.545, 0.03],
  [0.56, 0.1],
  [0.56, 1.42],
  [0.545, 1.53],
  [0.46, 1.63],
  [0.3, 1.7],
  [0.235, 1.74],
  [0.235, 1.86],
  [0.2, 1.86],
  [0.2, 1.76],
  [0.0, 1.76],
];

const LIQUID_PROFILE: [number, number][] = [
  [0, 0.09],
  [0.47, 0.09],
  [0.51, 0.13],
  [0.515, 0.22],
  [0.515, 1.08],
  [0, 1.08],
];

function useLabelTexture() {
  const invalidate = useThree((s) => s.invalidate);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

  useEffect(() => {
    const draw = () => {
      const c = tex.image as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 1024, 640);
      ctx.fillStyle = "rgba(244,240,232,0.94)";
      ctx.fillRect(0, 0, 1024, 640);
      ctx.fillStyle = "#401D32";
      ctx.textAlign = "center";
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "22px";
      ctx.font = '500 150px "Bodoni Moda", Didot, serif';
      ctx.fillText("VELORA", 522, 300);
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "12px";
      ctx.font = '500 34px "Instrument Sans", sans-serif';
      ctx.fillText("RADIANCE SERUM", 518, 390);
      ctx.fillStyle = "#C8AD85";
      ctx.fillRect(472, 440, 80, 2);
      ctx.fillStyle = "#401D32";
      ctx.font = '400 26px "Instrument Sans", sans-serif';
      ctx.fillText("30 ML · 1.0 FL OZ", 518, 520);
      tex.needsUpdate = true;
      invalidate();
    };
    draw();
    if (document.fonts) {
      Promise.all([
        document.fonts.load('500 150px "Bodoni Moda"'),
        document.fonts.load('500 34px "Instrument Sans"'),
      ])
        .then(draw)
        .catch(() => {});
    }
  }, [tex, invalidate]);

  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function GlassMaterial({ quality, thickness = 0.35 }: { quality: Quality; thickness?: number }) {
  if (quality === "low") {
    return (
      <meshPhysicalMaterial
        color="#f7f1ea"
        transparent
        opacity={0.3}
        roughness={0.05}
        clearcoat={1}
        envMapIntensity={1.8}
        depthWrite={false}
      />
    );
  }
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      transmission={1}
      thickness={thickness}
      roughness={0.02}
      ior={1.5}
      specularIntensity={1}
      clearcoat={1}
      clearcoatRoughness={0.02}
      attenuationColor="#f2e7da"
      attenuationDistance={2.2}
      envMapIntensity={1.8}
    />
  );
}

export function SerumBottle({
  quality = "high",
  getExplode,
  getLift,
  getDrop,
}: {
  quality?: Quality;
  getExplode?: () => number;
  getLift?: () => number;
  getDrop?: () => number;
}) {
  const dropRef = useRef<THREE.Mesh>(null);
  const dropGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 48, 32);
    const pos = g.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const taper = y > 0 ? 1 - y * 0.45 : 1;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
      pos.setY(i, y * (y > 0 ? 1.4 : 1));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => dropGeo.dispose(), [dropGeo]);
  const bulb = useRef<THREE.Group>(null);
  const collar = useRef<THREE.Group>(null);
  const pipette = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Group>(null);
  const label = useRef<THREE.Group>(null);

  const seg = quality === "high" ? 96 : 48;
  const glassGeo = useMemo(
    () => new THREE.LatheGeometry(GLASS_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), seg),
    [seg],
  );
  const liquidGeo = useMemo(
    () => new THREE.LatheGeometry(LIQUID_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), seg),
    [seg],
  );
  useEffect(
    () => () => {
      glassGeo.dispose();
      liquidGeo.dispose();
    },
    [glassGeo, liquidGeo],
  );

  const labelTex = useLabelTexture();

  useFrame(() => {
    // Explode: parts separate precisely along the bottle's vertical axis.
    const e = getExplode ? getExplode() : 0;
    // Lift: dropper assembly rises out of the neck and steps aside for the droplet shot.
    const l = getLift ? getLift() : 0;
    const lx = l * 0.9;
    const ly = l * 2.1;
    if (bulb.current) bulb.current.position.set(lx, 2.42 + ly + e * 2.0, 0);
    if (collar.current) collar.current.position.set(lx, 1.97 + ly + e * 1.55, 0);
    if (pipette.current) pipette.current.position.set(lx, 1.0 + ly + e * 1.1, 0);
    if (liquid.current) liquid.current.position.y = -e * 1.4;
    if (label.current) {
      const r = 1 + e * 0.38;
      label.current.scale.set(r, 1, r);
    }
    const d = getDrop ? getDrop() : 0;
    const m = dropRef.current;
    if (m) {
      m.visible = d > 0.001;
      if (m.visible) {
        const tipY = 0.18 + ly;
        const g = Math.min(d, 1);
        const f = Math.min(Math.max(d - 1, 0), 1);
        const b = Math.min(Math.max(d - 2, 0), 1);
        const s = 0.075 * g * (1 + b * b * 28);
        m.scale.setScalar(Math.max(s, 0.0001));
        m.position.set(lx, tipY - 0.075 * g * 1.1 - f * f * 1.2, 0);
      }
    }
  });

  return (
    <group position={[0, -1.05, 0]}>
      {/* Glass shell */}
      <group ref={glass}>
        <mesh geometry={glassGeo} castShadow>
          <GlassMaterial quality={quality} thickness={0.6} />
        </mesh>
      </group>

      {/* Liquid */}
      <group ref={liquid}>
        <mesh geometry={liquidGeo}>
          <meshPhysicalMaterial
            color="#d9a074"
            roughness={0.12}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            sheen={0.6}
            sheenColor="#f3d2b4"
            envMapIntensity={1.3}
            transparent={quality === "low"}
            opacity={quality === "low" ? 0.9 : 1}
          />
        </mesh>
      </group>

      {/* Label */}
      <group ref={label}>
        <mesh position={[0, 0.74, 0]}>
          <cylinderGeometry args={[0.566, 0.566, 0.6, seg, 1, true, -0.95, 1.9]} />
          <meshStandardMaterial map={labelTex} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Pipette */}
      <group ref={pipette}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.035, 1.6, 20]} />
          <GlassMaterial quality={quality} thickness={0.05} />
        </mesh>
        <mesh position={[0, -0.82, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshPhysicalMaterial color="#dca47a" roughness={0.1} clearcoat={1} />
        </mesh>
      </group>

      {/* Metallic collar */}
      <group ref={collar}>
        <mesh>
          <cylinderGeometry args={[0.275, 0.275, 0.42, seg]} />
          <meshStandardMaterial color="#C8AD85" metalness={1} roughness={0.2} envMapIntensity={1.6} />
        </mesh>
        <mesh position={[0, -0.205, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.275, 0.012, 12, seg]} />
          <meshStandardMaterial color="#e2cba5" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0.205, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.27, 0.01, 12, seg]} />
          <meshStandardMaterial color="#e2cba5" metalness={1} roughness={0.12} />
        </mesh>
      </group>

      {/* Hero droplet */}
      <mesh ref={dropRef} geometry={dropGeo} visible={false}>
        <meshPhysicalMaterial
          color="#e2ab80"
          roughness={0.03}
          clearcoat={1}
          clearcoatRoughness={0}
          sheen={0.5}
          sheenColor="#fbe2c8"
          envMapIntensity={1.8}
          transparent
          opacity={0.94}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dropper bulb */}
      <group ref={bulb}>
        <mesh>
          <capsuleGeometry args={[0.175, 0.32, 10, 32]} />
          <meshPhysicalMaterial color="#401D32" roughness={0.42} clearcoat={0.7} clearcoatRoughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}
