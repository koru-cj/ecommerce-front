// src/components/HeroEmbers.jsx
import { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatingGlow() {
  const mesh = useMemo(
    () =>
      new THREE.Mesh(
        new THREE.SphereGeometry(2, 32, 32),
        new THREE.MeshBasicMaterial({ color: '#fe8932', transparent: true, opacity: 0.06 })
      ),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mesh.position.y = Math.sin(t * 0.4) * 0.2 + 0.1;
  });

  return <primitive object={mesh} position={[0, 0.3, -1.5]} />;
}

export default function HeroEmbers() {
  // respetar reduce motion
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, mixBlendMode: 'screen' }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 3.2], fov: 35 }}>
        <Suspense fallback={null}>
          <FloatingGlow />
          <Sparkles count={80} speed={0.2} size={3} scale={[4.5, 2.2, 1]} color="#fe8932" noise={0.8} />
          <ambientLight intensity={0.3} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
