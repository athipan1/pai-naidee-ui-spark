import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { Mesh, Color } from 'three';

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
  const meshRef = useRef<Mesh>(null);
  const eyeLeftRef = useRef<Mesh>(null);
  const eyeRightRef = useRef<Mesh>(null);
  const mouthRef = useRef<Mesh>(null);
  
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
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          {...{
            color: new Color(statusColor),
            transparent: true,
            opacity: 0.8,
            emissive: new Color(statusColor),
            emissiveIntensity: animationMultipliers.glowIntensity * 0.2
          }}
        />
      </Sphere>
      
      {/* Eyes */}
      <Sphere ref={eyeLeftRef} args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      <Sphere ref={eyeRightRef} args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      
      {/* Eye pupils */}
      <Sphere args={[0.08, 16, 16]} position={[-0.3, 0.2, 0.9]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.3, 0.2, 0.9]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Mouth */}
      <Box ref={mouthRef} args={[0.3, 0.1, 0.1]} position={[0, -0.3, 0.8]}>
        <meshStandardMaterial color="#ff4444" />
      </Box>
      
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
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight {...{ intensity: 0.5 }} />
      <pointLight {...{ position: [10, 10, 10] }} />
      <Avatar3D 
        status={status}
        animationMultipliers={animationMultipliers}
        statusColor={statusColor}
      />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

export default ThreeJSScene;