'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * R3F chromosome — four curved chromatid arms meeting at a centromere, in
 * iridescent molten gold (MeshPhysicalMaterial, high clearcoat). Slow Y
 * rotation, mouse-tilt damped via lerp. Suspends frameloop when the tab is
 * hidden so we don't burn cycles in the background.
 *
 * Reduced-motion / low-end / no-WebGL bailouts are handled one level up
 * in Hero3D.tsx — by the time we get here, the device can run this scene.
 */
export function ChromosomeCanvas() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    function onVis() {
      setActive(!document.hidden);
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 35 }}
        frameloop={active ? 'always' : 'never'}
      >
        <Suspense fallback={null}>
          <Lights />
          <Chromosome />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#fff4d2" />
      <pointLight position={[-3, -2, 4]} intensity={0.9} color="#f4c842" />
      {/* Rim from behind */}
      <pointLight position={[0, 0, -6]} intensity={0.6} color="#a77f0e" />
    </>
  );
}

function Chromosome() {
  const groupRef = useRef<THREE.Group>(null);
  const targetTilt = useRef({ x: 0, y: 0 });

  // Each arm is a curved tube — four arms in an X pattern.
  const armGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.5, 0.6, 0.1),
      new THREE.Vector3(0.9, 1.4, 0),
      new THREE.Vector3(1.0, 2.1, -0.1),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.22, 18, false);
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#E8B11E'),
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.12,
        emissive: new THREE.Color('#3a2a05'),
        emissiveIntensity: 0.6,
        envMapIntensity: 1.2,
      }),
    [],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      // ±10° on Y, ±5° on X (clamped via THREE.MathUtils.degToRad)
      targetTilt.current.y = THREE.MathUtils.degToRad(x * 10);
      targetTilt.current.x = THREE.MathUtils.degToRad(-y * 5);
    }
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    // Slow continuous Y spin (~0.2 rad/s) plus mouse tilt damped via lerp.
    g.rotation.y += 0.2 * delta;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetTilt.current.x, 0.06);
    // Compose the parallax tilt onto the spinning Y so the spin always shows.
    const drift = THREE.MathUtils.lerp(g.userData.driftY ?? 0, targetTilt.current.y, 0.06);
    g.userData.driftY = drift;
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0]} scale={0.95}>
      {/* Four arms in X formation. Each arm rotated about Z to span quadrants. */}
      {[
        [0, 0, 0], // upper-right
        [0, 0, Math.PI / 2 + Math.PI / 2], // arms array uses rotation on Z
      ].map((_) => null)}
      <mesh geometry={armGeometry} material={material} rotation={[0, 0, 0]} />
      <mesh geometry={armGeometry} material={material} rotation={[0, 0, Math.PI]} />
      <mesh
        geometry={armGeometry}
        material={material}
        rotation={[0, Math.PI, 0]}
        position={[0, 0, 0]}
      />
      <mesh
        geometry={armGeometry}
        material={material}
        rotation={[0, Math.PI, Math.PI]}
        position={[0, 0, 0]}
      />

      {/* Centromere */}
      <mesh material={material}>
        <sphereGeometry args={[0.36, 48, 48]} />
      </mesh>
    </group>
  );
}
