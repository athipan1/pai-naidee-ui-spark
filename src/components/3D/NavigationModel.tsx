import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Float } from '@react-three/drei';
import { Mesh } from 'three';
import { AIStatus } from '@/shared/hooks/useSmartAI';

interface NavigationModelProps {
  status: AIStatus;
  statusColor: string;
  messages: any[];
}

// Avatar component with animations
const Avatar: React.FC<{ status: AIStatus; statusColor: string }> = ({ status, statusColor }) => {
  const meshRef = useRef<Mesh>(null);
  const eyeLeftRef = useRef<Mesh>(null);
  const eyeRightRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Status-specific animations
      switch (status) {
        case 'listening':
          meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.05);
          break;
        case 'thinking':
          meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
          break;
        case 'talking':
          meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.03);
          break;
        default:
          meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
      }
    }

    // Eye tracking
    if (eyeLeftRef.current && eyeRightRef.current) {
      const lookDirection = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
      eyeLeftRef.current.position.x = -0.3 + lookDirection;
      eyeRightRef.current.position.x = 0.3 + lookDirection;
    }
  });

  return (
    <group>
      {/* Main head */}
      <Sphere
        ref={meshRef}
        args={[1, 32, 32]}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={statusColor} metalness={0.3} roughness={0.4} />
      </Sphere>
      
      {/* Eyes */}
      <Sphere ref={eyeLeftRef} args={[0.1, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere ref={eyeRightRef} args={[0.1, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      
      {/* Pupils */}
      <Sphere args={[0.05, 16, 16]} position={[-0.3, 0.2, 0.85]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[0.3, 0.2, 0.85]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      
      {/* Mouth */}
      <Box args={[0.4, 0.1, 0.1]} position={[0, -0.3, 0.8]}>
        <meshStandardMaterial color="#ff6b6b" />
      </Box>
    </group>
  );
};

// Fallback 3D Avatar using CSS (as backup)
const FallbackAvatar: React.FC<{ status: AIStatus; statusColor: string }> = ({ status, statusColor }) => {
  const getStatusAnimation = () => {
    switch (status) {
      case 'listening':
        return 'animate-pulse';
      case 'thinking':
        return 'animate-spin';
      case 'talking':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        {/* Main head */}
        <div 
          className={`w-32 h-32 rounded-full border-4 ${getStatusAnimation()} transition-all duration-300`}
          style={{ 
            backgroundColor: statusColor,
            borderColor: statusColor,
            boxShadow: `0 0 30px ${statusColor}40`
          }}
        >
          {/* Eyes */}
          <div className="absolute top-8 left-6 w-4 h-4 bg-white rounded-full">
            <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="absolute top-8 right-6 w-4 h-4 bg-white rounded-full">
            <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full"></div>
          </div>
          
          {/* Mouth */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full transition-all duration-200 ${
            status === 'talking' ? 'animate-ping' : ''
          }`}></div>
        </div>
      </div>
    </div>
  );
};

// Error boundary component
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('3D Model Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
// Travel-themed floating objects
const FloatingObjects: React.FC = () => {
  return (
    <>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[-3, 2, 0]}
          fontSize={0.3}
          color="#0EA5E9"
          anchorX="center"
          anchorY="middle"
        >
          Travel
        </Text>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.5}>
        <Sphere args={[0.1]} position={[3, 1, -2]}>
          <meshStandardMaterial color="#86EFAC" emissive="#86EFAC" emissiveIntensity={0.2} />
        </Sphere>
      </Float>
      
      <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.2}>
        <Box args={[0.2, 0.2, 0.2]} position={[-2, -1, -1]}>
          <meshStandardMaterial color="#7DD3FC" metalness={0.5} roughness={0.2} />
        </Box>
      </Float>
    </>
  );
};

const NavigationModel: React.FC<NavigationModelProps> = ({ status, statusColor, messages }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-travel-blue-50 to-travel-green-100 rounded-lg overflow-hidden relative">
      <ThreeErrorBoundary fallback={<FallbackAvatar status={status} statusColor={statusColor} />}>
        <Suspense fallback={<FallbackAvatar status={status} statusColor={statusColor} />}>
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <pointLight position={[-10, -10, -5]} intensity={0.3} color="#7DD3FC" />
            
            {/* Avatar */}
            <Avatar status={status} statusColor={statusColor} />
            
            {/* Floating objects */}
            <FloatingObjects />
            
            {/* Controls */}
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={8}
              autoRotate={status === 'idle'}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>
      
      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              status === 'idle' ? 'bg-blue-500' :
              status === 'listening' ? 'bg-green-500 animate-pulse' :
              status === 'thinking' ? 'bg-yellow-500 animate-spin' :
              status === 'talking' ? 'bg-purple-500 animate-bounce' :
              'bg-red-500'
            }`}
          />
          <span className="text-sm capitalize">{status}</span>
        </div>
      </div>
      
      {/* Message count indicator */}
      {messages.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-travel-blue-500 text-white px-3 py-2 rounded-full text-sm">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </div>
      )}
    </div>
  );
};

export default NavigationModel;