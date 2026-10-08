import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { PALETTE } from "@/lib/story";
import { SerumBottle } from "./SerumBottle";

export default function ProductViewer() {
  const low = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, low ? 1.25 : 1.75]}
      gl={{ alpha: true, antialias: !low }}
      camera={{ fov: 30, position: [0, 0.2, 6.2] }}
    >
      <ambientLight intensity={0.15} />
      <spotLight position={[3, 5, 5]} angle={0.5} penumbra={1} intensity={30} decay={2} />
      <pointLight position={[-3, 1.8, -2]} color={PALETTE.champagne} intensity={28} decay={2} />
      <pointLight position={[3, -1, -2.5]} color={PALETTE.skin} intensity={22} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.2} color={PALETTE.champagne} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 7, 1]} />
        <Lightformer form="rect" intensity={1.8} color={PALETTE.skin} position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 7, 1]} />
      </Environment>
      <SerumBottle quality={low ? "low" : "high"} />
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.6} />
    </Canvas>
  );
}
