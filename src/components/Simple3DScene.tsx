import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import type { Group } from 'three';

interface AnimationMultipliers {
  rotationSpeed: number;
  scaleMultiplier: number;
  glowIntensity: number;
}

// Simple 3D Avatar Component
const Simple3DAvatar: React.FC<{ 
  status: string; 
  animationMultipliers: AnimationMultipliers; 
  statusColor: string 
}> = ({ 
  status, 
  animationMultipliers, 
  statusColor 
}) => {
  const meshRef = useRef<Group>(null);
  
  // Memoize colors to prevent recreation on every render
  const materialColor = useMemo(() => statusColor, [statusColor]);
  const emissiveColor = useMemo(() => statusColor, [statusColor]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Simple rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * animationMultipliers.rotationSpeed) * 0.1;
      meshRef.current.scale.setScalar(animationMultipliers.scaleMultiplier);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Simple head sphere */}
      <mesh {...({ position: [0, 0, 0] } satisfies ThreeElements['mesh'])}>
        <sphereGeometry {...({ args: [1, 32, 32] } satisfies ThreeElements['sphereGeometry'])} />
        <meshStandardMaterial 
          color={materialColor}
          {...({
            emissive: emissiveColor,
            emissiveIntensity: animationMultipliers.glowIntensity * 0.1,
          } satisfies ThreeElements['meshStandardMaterial'])}
        />
      </mesh>
      
      {/* Simple eyes */}
      <mesh {...({ position: [-0.3, 0.2, 0.8] } satisfies ThreeElements['mesh'])}>
        <sphereGeometry {...({ args: [0.1, 8, 8] } satisfies ThreeElements['sphereGeometry'])} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh {...({ position: [0.3, 0.2, 0.8] } satisfies ThreeElements['mesh'])}>
        <sphereGeometry {...({ args: [0.1, 8, 8] } satisfies ThreeElements['sphereGeometry'])} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Pupils */}
      <mesh {...({ position: [-0.3, 0.2, 0.85] } satisfies ThreeElements['mesh'])}>
        <sphereGeometry {...({ args: [0.05, 8, 8] } satisfies ThreeElements['sphereGeometry'])} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh {...({ position: [0.3, 0.2, 0.85] } satisfies ThreeElements['mesh'])}>
        <sphereGeometry {...({ args: [0.05, 8, 8] } satisfies ThreeElements['sphereGeometry'])} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Status text in 3D space */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color={materialColor}
        anchorX="center"
        anchorY="middle"
      >
        {status.toUpperCase()}
      </Text>
      
      {/* Floating chat bubble position */}
      <Html position={[2, 1, 0]} style={{ pointerEvents: 'none' }}>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg max-w-xs">
          <p className="text-sm text-gray-800">AI is ready to chat!</p>
        </div>
      </Html>
    </group>
  );
};

interface Simple3DSceneProps {
  status: string;
  animationMultipliers: AnimationMultipliers;
  statusColor: string;
}

const Simple3DScene: React.FC<Simple3DSceneProps> = ({ 
  status, 
  animationMultipliers, 
  statusColor 
}) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
        <ambientLight {...({ intensity: 0.6 } satisfies ThreeElements['ambientLight'])} />
        <directionalLight {...({ position: [5, 5, 5], intensity: 0.8 } satisfies ThreeElements['directionalLight'])} />
        <Simple3DAvatar 
          status={status}
          animationMultipliers={animationMultipliers}
          statusColor={statusColor}
        />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default Simple3DScene;