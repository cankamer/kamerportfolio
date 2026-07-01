"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* =========================================================================
   MOODY FLORAL — a live, scroll-reactive ambient backdrop.
   Drifting rose petals + gilt dust over a deep obsidian fog. Everything is
   instanced/pointcloud and the whole canvas sits behind the page content.
   ========================================================================= */

const DUST_COUNT = 340;
const ROSE = new THREE.Color("#c83a5e");
const GOLD = new THREE.Color("#c9a24b");
const GOLD_BRIGHT = new THREE.Color("#ecd18a");

/** Shared, normalized scroll progress (0 → 1) read by the scene each frame. */
function useScrollProgress() {
  const progress = useRef(0);
  useFrame(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  });
  return progress;
}

function Dust({ reduced }: { reduced: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const progress = useScrollProgress();

  const positions = useMemo(() => {
    const arr = new Float32Array(DUST_COUNT * 3);
    const SPREAD_X = 24;
    for (let i = 0; i < DUST_COUNT; i++) {
      // Stratified across X (one jittered point per column) so the left and
      // right halves get equal density instead of random left/right clumping.
      const colCenter = ((i + 0.5) / DUST_COUNT) * SPREAD_X - SPREAD_X / 2;
      const jitter = (Math.random() - 0.5) * (SPREAD_X / DUST_COUNT);
      arr[i * 3] = colCenter + jitter;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || reduced) return;
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      progress.current * -1.5,
      0.05
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={GOLD_BRIGHT}
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Camera breathes very slightly with the cursor for parallax depth. Listens on
 * window so it works even though the canvas wrapper is pointer-events-none.
 */
function ParallaxCamera({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      target.current.x = nx * 0.8;
      target.current.y = ny * 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame(() => {
    if (reduced) return;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.current.y, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function FloralScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0a0a0c"]} />
      <fogExp2 attach="fog" args={["#0a0a0c", 0.085]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[-6, 4, 4]} intensity={40} color={ROSE} distance={30} />
      <pointLight position={[6, -3, 2]} intensity={30} color={GOLD} distance={30} />
      <pointLight position={[0, 6, -4]} intensity={20} color={GOLD_BRIGHT} distance={30} />

      <Dust reduced={reduced} />
      <ParallaxCamera reduced={reduced} />
    </Canvas>
  );
}
