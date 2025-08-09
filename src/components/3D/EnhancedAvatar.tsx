import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, Vector3 } from 'three';
import { Sphere, Box, Cylinder, Cone } from '@react-three/drei';
import { GestureState } from './hooks/useEnhancedAIAssistant';
import { smoothTransition, gestureTransitions, createOptimizedMaterial } from './utils/assistantUtils';

interface EnhancedAvatarProps {
  status: string;
  statusColor: string;
  gestureState: GestureState;
  onGestureComplete: () => void;
  quality: 'low' | 'medium' | 'high';
  lodLevel: number;
  enableBreathing: boolean;
  enableEyeMovement: boolean;
  smoothTransitions: boolean;
  onInteraction: (type: 'hover' | 'click' | 'unhover') => void;
}

const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({
  status,
  statusColor,
  gestureState,
  onGestureComplete,
  quality,
  lodLevel,
  enableBreathing,
  enableEyeMovement,
  smoothTransitions,
  onInteraction
}) => {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const leftEyeRef = useRef<Mesh>(null);
  const rightEyeRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [gestureStartTime, setGestureStartTime] = useState(0);

  // Start gesture animation when target changes
  useEffect(() => {
    if (gestureState.isTransitioning) {
      setGestureStartTime(Date.now());
      setAnimationProgress(0);
    }
  }, [gestureState.target, gestureState.isTransitioning]);

  // Calculate polygon count based on LOD level
  const getGeometryArgs = (baseDetail: number) => {
    const reduction = lodLevel === 0 ? 1 : lodLevel === 1 ? 0.6 : 0.3;
    return Math.max(8, Math.floor(baseDetail * reduction));
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsedTime = state.clock.elapsedTime;
    
    // Breathing animation
    if (enableBreathing && bodyRef.current) {
      const breathScale = 1 + Math.sin(elapsedTime * 1.5) * 0.02;
      bodyRef.current.scale.setScalar(breathScale);
    }

    // Eye movement
    if (enableEyeMovement && leftEyeRef.current && rightEyeRef.current) {
      const lookDirection = Math.sin(elapsedTime * 0.8) * 0.15;
      const blinkFactor = Math.sin(elapsedTime * 3) > 0.95 ? 0.1 : 1;
      
      leftEyeRef.current.position.x = -0.25 + lookDirection;
      rightEyeRef.current.position.x = 0.25 + lookDirection;
      leftEyeRef.current.scale.y = blinkFactor;
      rightEyeRef.current.scale.y = blinkFactor;
    }

    // Gesture animation
    if (gestureState.isTransitioning && gestureStartTime > 0) {
      const currentTime = Date.now();
      const gestureConfig = gestureTransitions[gestureState.target as keyof typeof gestureTransitions];
      const duration = gestureConfig?.duration || 1000;
      const progress = Math.min((currentTime - gestureStartTime) / duration, 1);
      
      setAnimationProgress(progress);
      
      // Apply gesture-specific animations
      performGesture(gestureState.target, progress, elapsedTime);
      
      // Complete gesture when animation is done
      if (progress >= 1) {
        onGestureComplete();
        setGestureStartTime(0);
      }
    } else {
      // Idle animations when not gesturing
      performIdleAnimation(elapsedTime);
    }

    // Status-specific animations
    performStatusAnimation(status, elapsedTime);
  });

  const performGesture = (gesture: string, progress: number, elapsedTime: number) => {
    if (!groupRef.current || !headRef.current || !leftArmRef.current || !rightArmRef.current) return;

    const easedProgress = smoothTransitions ? 
      smoothTransition(0, 1, progress, gestureTransitions[gesture as keyof typeof gestureTransitions]?.easing || 'easeInOut') : 
      progress;

    switch (gesture) {
      case 'wave':
        performWaveGesture(easedProgress, elapsedTime);
        break;
      case 'nod':
        performNodGesture(easedProgress);
        break;
      case 'point_to_ui':
        performPointGesture(easedProgress);
        break;
      case 'hand_gestures':
        performHandGestures(easedProgress, elapsedTime);
        break;
      case 'jump_slightly':
        performJumpGesture(easedProgress);
        break;
      case 'scratch_head':
        performScratchHeadGesture(easedProgress, elapsedTime);
        break;
      case 'eating_gesture':
        performEatingGesture(easedProgress, elapsedTime);
        break;
      case 'sleeping_gesture':
        performSleepingGesture(easedProgress);
        break;
      case 'driving_gesture':
        performDrivingGesture(easedProgress, elapsedTime);
        break;
      case 'weather_gesture':
        performWeatherGesture(easedProgress, elapsedTime);
        break;
    }
  };

  const performWaveGesture = (progress: number, elapsedTime: number) => {
    if (!rightArmRef.current) return;
    
    const waveAngle = Math.sin(elapsedTime * 8) * 0.5 * progress;
    rightArmRef.current.rotation.z = -Math.PI / 4 - waveAngle;
    rightArmRef.current.rotation.x = Math.sin(progress * Math.PI) * 0.3;
  };

  const performNodGesture = (progress: number) => {
    if (!headRef.current) return;
    
    const nodAngle = Math.sin(progress * Math.PI * 2) * 0.2;
    headRef.current.rotation.x = nodAngle;
  };

  const performPointGesture = (progress: number) => {
    if (!rightArmRef.current) return;
    
    rightArmRef.current.rotation.z = -Math.PI / 3 * progress;
    rightArmRef.current.rotation.y = Math.PI / 6 * progress;
  };

  const performHandGestures = (progress: number, elapsedTime: number) => {
    if (!leftArmRef.current || !rightArmRef.current) return;
    
    const leftMotion = Math.sin(elapsedTime * 2) * 0.3 * progress;
    const rightMotion = Math.sin(elapsedTime * 2 + Math.PI) * 0.3 * progress;
    
    leftArmRef.current.rotation.z = leftMotion;
    rightArmRef.current.rotation.z = rightMotion;
  };

  const performJumpGesture = (progress: number) => {
    if (!groupRef.current) return;
    
    const jumpHeight = Math.sin(progress * Math.PI) * 0.3;
    groupRef.current.position.y = jumpHeight;
  };

  const performScratchHeadGesture = (progress: number, elapsedTime: number) => {
    if (!rightArmRef.current || !headRef.current) return;
    
    rightArmRef.current.rotation.z = -Math.PI / 2 * progress;
    rightArmRef.current.position.y = 0.5 * progress;
    
    if (progress > 0.5) {
      const scratchMotion = Math.sin(elapsedTime * 10) * 0.1;
      rightArmRef.current.position.x = scratchMotion;
    }
  };

  const performEatingGesture = (progress: number, elapsedTime: number) => {
    if (!rightArmRef.current) return;
    
    const eatMotion = Math.sin(elapsedTime * 4) * 0.2 * progress;
    rightArmRef.current.rotation.x = -Math.PI / 4 + eatMotion;
    rightArmRef.current.rotation.z = -Math.PI / 6;
  };

  const performSleepingGesture = (progress: number) => {
    if (!headRef.current || !groupRef.current) return;
    
    headRef.current.rotation.z = Math.PI / 8 * progress;
    groupRef.current.scale.setScalar(1 - 0.1 * progress);
  };

  const performDrivingGesture = (progress: number, elapsedTime: number) => {
    if (!leftArmRef.current || !rightArmRef.current) return;
    
    const steerMotion = Math.sin(elapsedTime * 1.5) * 0.2 * progress;
    leftArmRef.current.rotation.y = -Math.PI / 4 + steerMotion;
    rightArmRef.current.rotation.y = Math.PI / 4 - steerMotion;
  };

  const performWeatherGesture = (progress: number, elapsedTime: number) => {
    if (!leftArmRef.current || !rightArmRef.current) return;
    
    const weatherMotion = Math.sin(elapsedTime * 3) * 0.3 * progress;
    leftArmRef.current.rotation.z = Math.PI / 2 + weatherMotion;
    rightArmRef.current.rotation.z = -Math.PI / 2 - weatherMotion;
  };

  const performIdleAnimation = (elapsedTime: number) => {
    if (!groupRef.current) return;
    
    // Gentle floating
    groupRef.current.position.y = Math.sin(elapsedTime * 0.5) * 0.05;
    
    // Subtle rotation
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(elapsedTime * 0.3) * 0.1;
    }
  };

  const performStatusAnimation = (currentStatus: string, elapsedTime: number) => {
    if (!groupRef.current) return;

    switch (currentStatus) {
      case 'listening':
        groupRef.current.scale.setScalar(1 + Math.sin(elapsedTime * 3) * 0.03);
        break;
      case 'thinking':
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(elapsedTime * 2) * 0.15;
        }
        break;
      case 'talking':
        groupRef.current.scale.setScalar(1 + Math.sin(elapsedTime * 4) * 0.02);
        break;
    }
  };

  const handlePointerOver = () => {
    setHovered(true);
    onInteraction('hover');
  };

  const handlePointerOut = () => {
    setHovered(false);
    onInteraction('unhover');
  };

  const handleClick = () => {
    setClicked(true);
    onInteraction('click');
    setTimeout(() => setClicked(false), 200);
  };

  // Optimize geometry based on quality and LOD
  const sphereDetail = getGeometryArgs(quality === 'high' ? 32 : quality === 'medium' ? 16 : 8);
  const boxDetail = getGeometryArgs(quality === 'high' ? 16 : quality === 'medium' ? 8 : 4);

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Body */}
      <Cylinder ref={bodyRef} args={[0.6, 0.8, 1.5, boxDetail]} position={[0, -0.75, 0]}>
        <primitive object={createOptimizedMaterial(statusColor, quality)} />
      </Cylinder>

      {/* Head */}
      <Sphere ref={headRef} args={[0.8, sphereDetail, sphereDetail]} position={[0, 0.5, 0]}>
        <primitive object={createOptimizedMaterial(statusColor, quality)} />
      </Sphere>

      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.12, sphereDetail / 2, sphereDetail / 2]} position={[-0.25, 0.6, 0.6]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere ref={rightEyeRef} args={[0.12, sphereDetail / 2, sphereDetail / 2]} position={[0.25, 0.6, 0.6]}>
        <meshStandardMaterial color="white" />
      </Sphere>

      {/* Pupils */}
      <Sphere args={[0.06, sphereDetail / 4, sphereDetail / 4]} position={[-0.25, 0.6, 0.7]}>
        <meshStandardMaterial color="black" />
      </Sphere>
      <Sphere args={[0.06, sphereDetail / 4, sphereDetail / 4]} position={[0.25, 0.6, 0.7]}>
        <meshStandardMaterial color="black" />
      </Sphere>

      {/* Mouth */}
      <Box args={[0.3, 0.08, 0.08]} position={[0, 0.3, 0.75]}>
        <meshStandardMaterial color="#ff6b6b" />
      </Box>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.9, 0, 0]}>
        <Cylinder args={[0.15, 0.15, 1, boxDetail]} rotation={[0, 0, Math.PI / 2]}>
          <primitive object={createOptimizedMaterial(statusColor, quality)} />
        </Cylinder>
      </group>
      
      <group ref={rightArmRef} position={[0.9, 0, 0]}>
        <Cylinder args={[0.15, 0.15, 1, boxDetail]} rotation={[0, 0, Math.PI / 2]}>
          <primitive object={createOptimizedMaterial(statusColor, quality)} />
        </Cylinder>
      </group>

      {/* Visual feedback for interactions */}
      {hovered && (
        <Sphere args={[1.2, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={statusColor} 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </Sphere>
      )}

      {clicked && (
        <Sphere args={[1.5, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            wireframe 
          />
        </Sphere>
      )}
    </group>
  );
};

export default EnhancedAvatar;