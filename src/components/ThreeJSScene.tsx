import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AnimationMultipliers {
  rotationSpeed: number;
  scaleMultiplier: number;
  glowIntensity: number;
}

// 3D Avatar Component
const Avatar3D: React.FC<{ 
  status: string; 
  animationMultipliers: AnimationMultipliers; 
  statusColor: string 
}> = ({ 
  status, 
  animationMultipliers, 
  statusColor 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Main body rotation and scaling
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * animationMultipliers.rotationSpeed) * 0.1;
      meshRef.current.scale.setScalar(animationMultipliers.scaleMultiplier);
    }
    
    // Eye blinking animation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blinkTime = Math.sin(state.clock.elapsedTime * 3) > 0.9 ? 0.1 : 1;
      eyeLeftRef.current.scale.y = blinkTime;
      eyeRightRef.current.scale.y = blinkTime;
    }
    
    // Mouth animation for talking
    if (mouthRef.current && status === 'talking') {
      const talkingAnimation = Math.sin(state.clock.elapsedTime * 8) * 0.3 + 0.3;
      mouthRef.current.scale.x = 1 + talkingAnimation;
      mouthRef.current.scale.y = 1 + talkingAnimation * 0.5;
    } else if (mouthRef.current) {
      mouthRef.current.scale.x = 1;
      mouthRef.current.scale.y = 1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={new THREE.Color(statusColor)}
          transparent
          opacity={0.8}
          emissive={new THREE.Color(statusColor)}
          emissiveIntensity={animationMultipliers.glowIntensity * 0.2}
        />
      </mesh>
      
      {/* Eyes */}
      <mesh ref={eyeLeftRef} position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Eye pupils */}
      <mesh position={[-0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.8]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      
      {/* Status indicator */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.2}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {status.toUpperCase()}
      </Text>
    </group>
  );
};

interface ThreeJSSceneProps {
  status: string;
  animationMultipliers: AnimationMultipliers;
  statusColor: string;
}

const ThreeJSScene: React.FC<ThreeJSSceneProps> = ({ 
  status, 
  animationMultipliers, 
  statusColor 
}) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Avatar3D 
          status={status}
          animationMultipliers={animationMultipliers}
          statusColor={statusColor}
        />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ThreeJSScene;