import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useMemo, useRef, useState } from "react";
import "./App.css";

export function MakeMesh() {
  const leftTilt = useRef<number>(0); // radians
  const midTilt = useRef<number>(0);

  const leftRef = useRef<THREE.Group>(null!);
  const midRef = useRef<THREE.Group>(null!);

  const running = useRef(false);
  const hit = useRef(false);

  const SPEED_LEFT = 0.5; // rad/s
  const SPEED_MIDDLE = 0.8; // rad/s
  const CONTACT_AT = -0.2; // when left passes this tilt, start the middle (≈ -18°)

  const LEFT_STOP_AT = -0.3;
  const MID_STOP_AT = -0.15;

  useFrame((_, dt) => {
    if (!running.current) return;

    // Left falls first
    if (leftTilt.current > LEFT_STOP_AT) {
      leftTilt.current -= SPEED_LEFT * dt;
      if (leftTilt.current < LEFT_STOP_AT) leftTilt.current = LEFT_STOP_AT;
      leftRef.current.rotation.z = leftTilt.current;
    }

    // Trigger the middle once left crosses a simple threshold
    if (!hit.current && leftTilt.current <= CONTACT_AT) {
      hit.current = true;
    }

    // Middle falls after "contact"
    if (hit.current && midTilt.current > MID_STOP_AT) {
      midTilt.current -= SPEED_MIDDLE * dt;
      if (midTilt.current < MID_STOP_AT) midTilt.current = MID_STOP_AT;
      midRef.current.rotation.z = midTilt.current;
    }

    // Stop when both are down
    if (
      leftTilt.current <= LEFT_STOP_AT &&
      (!hit.current || midTilt.current <= LEFT_STOP_AT)
    ) {
      running.current = false;
    }
  });

  const start = () => {
    if (running.current) return;
    // Only start if upright
    if (Math.abs(leftTilt.current) > 1e-3) return;
    running.current = true;
    hit.current = false;
  };

  return (
    <>
      <group
        ref={leftRef}
        position={[-1, 0, 0]}
        rotation={[0, 0, 0]}
        onPointerDown={start}
      >
        <mesh castShadow receiveShadow>
          <RoundedBox
            position={[0, 2 / 2, 0]}
            args={[0.75, 2, 1]}
            radius={0.05}
            smoothness={2}
          >
            <meshStandardMaterial
              metalness={0.2}
              roughness={0.6}
              color="#ff009a"
            />
          </RoundedBox>
        </mesh>
      </group>
      <group ref={midRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBox
            position={[0, 2 / 2, 0]}
            args={[0.75, 2, 1]}
            radius={0.05}
            smoothness={2}
          >
            <meshStandardMaterial
              metalness={0.2}
              roughness={0.6}
              color="#ff009a"
            />
          </RoundedBox>
        </mesh>
      </group>
      <group position={[1, 0, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <RoundedBox
            position={[0, 2 / 2, 0]}
            args={[0.75, 2, 1]}
            radius={0.05}
            smoothness={2}
          >
            <meshStandardMaterial
              metalness={0.2}
              roughness={0.6}
              color="#ff009a"
            />
          </RoundedBox>
        </mesh>
      </group>
    </>
  );
}

export default function App() {
  const [playing, setPlaying] = useState(false);
  const prefersReduced = useMemo(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    []
  );

  // Approximate Make gradient bg; don’t claim official hexes
  const gradient =
    "linear-gradient(135deg, #6c2ffb 0%, #ff2fb9 60%, #ffe6f3 100%)";

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div className="relative" style={{ height: "100%", width: "100%" }}>
        <div className="absolute inset-0" style={{ background: gradient }} />
        <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 3, 8], fov: 45 }}>
          {/* basic lighting + background */}
          <color attach="background" args={["#240045"]} />
          <hemisphereLight intensity={0.25} />
          <directionalLight
            castShadow
            position={[5, 5, 5]}
            intensity={2.0}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <Suspense fallback={null}>
            <MakeMesh />
          </Suspense>

          <OrbitControls enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>
    </div>
  );
}
