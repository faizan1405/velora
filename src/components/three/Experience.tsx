import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { S, mouse, drag, PALETTE, sceneBus } from "@/lib/story";
import { useUI } from "@/lib/ui-store";
import { SerumBottle, type Quality } from "./SerumBottle";
import { Ingredients, Particles } from "./SceneParts";

function Rig() {
  const invalidate = useThree((s) => s.invalidate);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    sceneBus.invalidate = invalidate;
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      invalidate();
    };
    const onResize = () => invalidate();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      sceneBus.invalidate = () => {};
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [invalidate]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-4 * dt);
    mouse.sx += (mouse.x - mouse.sx) * k;
    mouse.sy += (mouse.y - mouse.sy) * k;
    const cam = state.camera;
    cam.position.set(S.camX + mouse.sx * 0.16, S.camY + mouse.sy * 0.1, S.camZ);
    target.set(S.tgtX + mouse.sx * 0.04, S.tgtY + mouse.sy * 0.03, S.tgtZ);
    cam.lookAt(target);
    const pc = cam as THREE.PerspectiveCamera;
    if (Math.abs(pc.fov - S.fov) > 0.01) {
      pc.fov = S.fov;
      pc.updateProjectionMatrix();
    }
    state.scene.environmentIntensity = 0.12 + 0.88 * S.intro;
    if (Math.abs(mouse.x - mouse.sx) > 0.0005 || Math.abs(mouse.y - mouse.sy) > 0.0005) state.invalidate();
  });
  return null;
}

function Lights() {
  const key = useRef<THREE.SpotLight>(null);
  const rimA = useRef<THREE.PointLight>(null);
  const rimB = useRef<THREE.PointLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const cSkin = useMemo(() => new THREE.Color(PALETTE.skin), []);
  const cPlum = useMemo(() => new THREE.Color("#b0577f"), []);
  const cCool = useMemo(() => new THREE.Color("#dfe9f2"), []);
  const cWarm = useMemo(() => new THREE.Color("#ffd8b4"), []);

  useFrame(({ clock }) => {
    const i = S.intro;
    const t = clock.elapsedTime;
    if (key.current) {
      key.current.intensity = 70 * i * S.key;
      key.current.color.copy(cCool).lerp(cWarm, S.warm);
      key.current.position.set(3 + mouse.sx * 1.2 + Math.sin(t * 0.3) * 0.15, 5 + mouse.sy * 0.6, 5);
    }
    if (rimA.current) rimA.current.intensity = 18 * i * S.rim;
    if (rimB.current) {
      rimB.current.intensity = 14 * i * S.rim;
      rimB.current.color.copy(cSkin).lerp(cPlum, S.rimHue);
    }
    if (amb.current) amb.current.intensity = 0.03 + S.ambient * i;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.05} />
      <spotLight ref={key} position={[3, 5, 5]} angle={0.55} penumbra={1} decay={2} intensity={0} />
      <pointLight ref={rimA} position={[-3, 1.8, -2]} color={PALETTE.champagne} decay={2} intensity={0} />
      <pointLight ref={rimB} position={[3, -1, -2.5]} decay={2} intensity={0} />
    </>
  );
}

function StoryBottle({ quality }: { quality: Quality }) {
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const setUI = useUI((s) => s.set);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      drag.lastX = e.clientX;
      drag.rot += dx * 0.01;
      drag.vel = dx * 0.004;
      invalidate();
    };
    const onUp = () => {
      drag.active = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [invalidate]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const buy = useUI.getState().buyActive;
    if (!drag.active) {
      drag.rot += drag.vel;
      drag.vel *= Math.exp(-4 * dt);
      // settle naturally back toward the hero angle after release
      if (buy) drag.rot *= Math.exp(-0.9 * dt);
      if (!buy) drag.rot *= Math.exp(-3 * dt);
      if (Math.abs(drag.vel) > 1e-4 || (!buy && Math.abs(drag.rot) > 1e-3)) state.invalidate();
    }
    const grp = g.current;
    if (!grp) return;
    const t = state.clock.elapsedTime;
    const floatY = Math.sin(t * 0.8) * 0.012;
    const floatR = Math.sin(t * 0.45) * 0.012;
    grp.position.set(S.bX + mouse.sx * 0.04, S.bY + mouse.sy * 0.03 + floatY, S.bZ);
    grp.rotation.set(S.bRotX - mouse.sy * 0.05, S.bRotY + drag.rot + mouse.sx * 0.1 + floatR, S.bRotZ);
    grp.scale.setScalar(S.bScale);
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!useUI.getState().buyActive) return;
    e.stopPropagation();
    drag.active = true;
    drag.lastX = e.nativeEvent.clientX;
  };

  return (
    <group
      ref={g}
      onPointerDown={onDown}
      onPointerOver={() => useUI.getState().buyActive && setUI({ cursor: "drag" })}
      onPointerOut={() => setUI({ cursor: "default" })}
    >
      <SerumBottle quality={quality} getExplode={() => S.explode} getLift={() => S.lift} getDrop={() => S.drop} />
    </group>
  );
}

export default function Experience({ quality }: { quality: Quality }) {
  const setUI = useUI((s) => s.set);
  return (
    <Canvas
      frameloop={quality === "high" ? "always" : "demand"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, position: [0, 0, 7], near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(() => requestAnimationFrame(() => setUI({ sceneReady: true })));
      }}
      style={{ touchAction: "pan-y" }}
    >
      <AdaptiveDpr />
      <Rig />
      <Lights />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.2} color={PALETTE.champagne} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 7, 1]} />
        <Lightformer form="rect" intensity={1.8} color={PALETTE.skin} position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 7, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, -5]} scale={3} />
        <Lightformer form="rect" intensity={1} position={[0, -3, 3]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
      <StoryBottle quality={quality} />
      <Ingredients quality={quality} />
      <Particles count={quality === "high" ? 1400 : 420} />
    </Canvas>
  );
}
