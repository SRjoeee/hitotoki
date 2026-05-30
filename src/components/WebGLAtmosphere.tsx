import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WebGLAtmosphereProps {
  activeSceneId: string; // 'hero' | 'hunter' | 'temple' | 'blade' | 'concept' | 'cta'
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
}

export default function WebGLAtmosphere({ activeSceneId, mousePosRef }: WebGLAtmosphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Particle system refs
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const particlePositionsRef = useRef<Float32Array | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);
  const particleCountRef = useRef<number>(1000);

  // Animation values for smooth transitions
  const targetColorRef = useRef<THREE.Color>(new THREE.Color(0xffffff));
  const currentColorRef = useRef<THREE.Color>(new THREE.Color(0xffffff));
  const targetSizeRef = useRef<number>(0.05);
  const currentSizeRef = useRef<number>(0.05);
  const targetSpeedMultiplierRef = useRef<number>(1.0);
  const currentSpeedMultiplierRef = useRef<number>(1.0);
  const particleTypeRef = useRef<'snow' | 'smoke' | 'sparks' | 'ambient'>('ambient');

  // Set target atmosphere based on active scene
  useEffect(() => {
    switch (activeSceneId) {
      case 'hero':
        targetColorRef.current.setHex(0xbabcc2); // Gentle ambient silver-gray
        targetSizeRef.current = 0.04;
        targetSpeedMultiplierRef.current = 0.4;
        particleTypeRef.current = 'ambient';
        break;
      case 'hunter':
        targetColorRef.current.setHex(0x9fcab2); // Winter forest mist / green ice
        targetSizeRef.current = 0.06;
        targetSpeedMultiplierRef.current = 0.8;
        particleTypeRef.current = 'snow';
        break;
      case 'temple':
        targetColorRef.current.setHex(0xf3a85e); // Candlelight incense embers
        targetSizeRef.current = 0.08;
        targetSpeedMultiplierRef.current = 0.5;
        particleTypeRef.current = 'smoke';
        break;
      case 'blade':
        targetColorRef.current.setHex(0xe8edf5); // Tension-filled silver steel particles
        targetSizeRef.current = 0.035;
        targetSpeedMultiplierRef.current = 1.3;
        particleTypeRef.current = 'sparks';
        break;
      case 'concept':
        targetColorRef.current.setHex(0xaaaaaa); // Quiet neutral slow dust
        targetSizeRef.current = 0.03;
        targetSpeedMultiplierRef.current = 0.3;
        particleTypeRef.current = 'ambient';
        break;
      case 'cta':
        targetColorRef.current.setHex(0xbf9a62); // Golden luxury tint
        targetSizeRef.current = 0.05;
        targetSpeedMultiplierRef.current = 0.5;
        particleTypeRef.current = 'ambient';
        break;
      default:
        targetColorRef.current.setHex(0xffffff);
        targetSizeRef.current = 0.04;
        targetSpeedMultiplierRef.current = 0.5;
        particleTypeRef.current = 'ambient';
    }
  }, [activeSceneId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Setup ThreeJS Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Add deep environmental fog for quiet cinematic depth
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.03);

    // Camera with slight depth
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    camera.position.z = 10;
    cameraRef.current = camera;

    // WebGL Renderer with Alpha support so background flows cleanly
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Setup Particles
    const maxParticles = 1200;
    particleCountRef.current = maxParticles;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);

    // Spread particles throughout a beautiful coordinate box
    for (let i = 0; i < maxParticles; i++) {
      const idx = i * 3;
      // Coordinates inside x=[-15, 15], y=[-10, 10], z=[-12, 10]
      positions[idx] = (Math.random() - 0.5) * 30;
      positions[idx + 1] = (Math.random() - 0.5) * 20;
      positions[idx + 2] = (Math.random() - 0.5) * 22;

      // Velocities
      velocities[idx] = (Math.random() - 0.5) * 0.02; // x speed
      velocities[idx + 1] = (Math.random() - 0.5) * 0.02; // y speed
      velocities[idx + 2] = (Math.random() - 0.5) * 0.02; // z speed
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlePositionsRef.current = positions;
    particleVelocitiesRef.current = velocities;

    // Clean round texture for atmospheric light circles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Points Material
    const material = new THREE.PointsMaterial({
      size: 0.05,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffffff,
      opacity: 0.65,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // 3. Handle Window Resizing with ResizeObserver
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse drift factor reference
    const mouseDriftXRef = { value: 0 };
    const mouseDriftYRef = { value: 0 };

    // 4. Main Animation Frame Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1); // Guard against giant lag jumps
      
      // Interpolate sizes, speeds, colors smoothly for zen fading feel
      currentColorRef.current.lerp(targetColorRef.current, delta * 3.0);
      currentSizeRef.current += (targetSizeRef.current - currentSizeRef.current) * delta * 2.5;
      currentSpeedMultiplierRef.current += (targetSpeedMultiplierRef.current - currentSpeedMultiplierRef.current) * delta * 2.5;

      // Update material
      if (particleSystem && material) {
        material.color.copy(currentColorRef.current);
        material.size = currentSizeRef.current;
      }

      // Smooth camera parallax following mouse coordinate drifts
      if (camera) {
        const targetCamX = mousePosRef.current.x * 2.5;
        const targetCamY = mousePosRef.current.y * 1.5;
        camera.position.x += (targetCamX - camera.position.x) * delta * 2.0;
        camera.position.y += (targetCamY - camera.position.y) * delta * 2.0;
        camera.lookAt(0, 0, 0);
      }

      // Update positions of the individual particles
      if (particlePositionsRef.current && particleVelocitiesRef.current && particleSystem) {
        const posAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
        const count = posAttr.count;

        mouseDriftXRef.value += (mousePosRef.current.x * 0.01 - mouseDriftXRef.value) * delta * 3.0;
        mouseDriftYRef.value += (-mousePosRef.current.y * 0.01 - mouseDriftYRef.value) * delta * 3.0;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          let px = posAttr.getX(i);
          let py = posAttr.getY(i);
          let pz = posAttr.getZ(i);

          // Customize movement style depending on scene motif
          const pType = particleTypeRef.current;
          const speedFactor = currentSpeedMultiplierRef.current;

          if (pType === 'snow') {
            // Hunter Scene: Floating snow/mist falling slowly down & left
            py -= delta * 1.1 * speedFactor;
            px += (Math.sin(py * 0.5 + i) * 0.01 - 0.01) * speedFactor;
          } else if (pType === 'smoke') {
            // Temple Scene: Incense smoke/candle glow floating upwards & sideways drifting
            py += delta * 0.9 * speedFactor;
            px += Math.sin(py * 0.3 + i * 0.1) * 0.02 * speedFactor;
          } else if (pType === 'sparks') {
            // Blade Scene: Intense spark sparks flickering rapidly with fast horizontal breeze
            px += delta * 2.2 * speedFactor;
            py += (Math.sin(px * 0.8 + i) * 0.04 - 0.01) * speedFactor;
          } else {
            // Ambient / Hero scene: Extremely sluggish slow Brownian drift
            px += Math.sin(py * 0.1 + i) * 0.003 * speedFactor;
            py += Math.cos(px * 0.1 + i) * 0.003 * speedFactor;
          }

          // Apply mouse force offsets
          px += mouseDriftXRef.value;
          py += mouseDriftYRef.value;

          // Wrap boundaries so there's never an empty void
          if (py < -12) py = 12;
          if (py > 12) py = -12;
          if (px < -18) px = 18;
          if (px > 18) px = -18;

          posAttr.setXYZ(i, px, py, pz);
        }

        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanups on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Three.js Container Layer */}
      <div 
        id="webgl-atmosphere-container"
        ref={mountRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden" 
      />

      {/* Cinematic Soft Vignette Radial Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-15 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,6,8,0.75)_100%)]" />
    </>
  );
}
