import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VideoLayerProps {
  activeSceneId: string;
  scrollProgressRef: React.MutableRefObject<number>;
}

export default function VideoLayer({ activeSceneId, scrollProgressRef }: VideoLayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Mutable refs to decouple animation loop from React renders
  const currentVideoTimeRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // We do not autoPlay. We rely on the requestAnimationFrame loop to scrub `currentTime`.
    // Explicitly play and pause once to ensure the browser unlocks the video decoding pipeline
    const unlockVideo = async () => {
      try {
        await video.play();
        video.pause();
      } catch (e) {
        // Autoplay might be blocked, that's fine for scrubbing
      }
    };
    unlockVideo();

    // 1. Setup ThreeJS Scene
    const scene = new THREE.Scene();
    
    // Orthographic camera for full screen 2D render without perspective distortion
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Video Texture & Shader Material
    // Use standard Texture instead of VideoTexture. 
    // VideoTexture relies on requestVideoFrameCallback which stops firing when video is paused.
    // By using Texture and manually setting needsUpdate = true, we force WebGL to upload the scrubbed frame.
    const videoTexture = new THREE.Texture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.generateMipmaps = false;

    // Custom Shader to apply the cinematic color grading
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: videoTexture },
        brightness: { value: 0.65 }, // Brighter base (was 0.35)
        contrast: { value: 1.05 },   // Slightly less crushed contrast (was 1.15)
        saturation: { value: 0.8 },  // More natural color (was 0.6)
        sepia: { value: 0.05 }       // Extremely subtle warmth (was 0.1)
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform float sepia;
        varying vec2 vUv;

        void main() {
          vec4 texColor = texture2D(tDiffuse, vUv);
          
          // Apply Brightness
          texColor.rgb *= brightness;

          // Apply Contrast
          texColor.rgb = (texColor.rgb - 0.5) * contrast + 0.5;

          // Apply Saturation
          float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
          texColor.rgb = mix(vec3(luminance), texColor.rgb, saturation);

          // Apply Sepia
          vec3 sepiaColor = vec3(
            (texColor.r * 0.393) + (texColor.g * 0.769) + (texColor.b * 0.189),
            (texColor.r * 0.349) + (texColor.g * 0.686) + (texColor.b * 0.168),
            (texColor.r * 0.272) + (texColor.g * 0.534) + (texColor.b * 0.131)
          );
          texColor.rgb = mix(texColor.rgb, sepiaColor, sepia);

          gl_FragColor = vec4(texColor.rgb, 1.0);
        }
      `,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 3. Resize handler (Simulates CSS object-cover without stretching)
    const updateCover = () => {
      if (!container) return;
      
      const screenW = container.clientWidth;
      const screenH = container.clientHeight;
      const screenAspect = screenW / screenH;
      
      const videoW = video.videoWidth || 1280;
      const videoH = video.videoHeight || 720;
      const videoAspect = videoW / videoH;
      
      // Reset scale
      mesh.scale.set(1, 1, 1);
      
      // Apply exact object-cover math to the orthographic projection UVs/scale
      if (screenAspect > videoAspect) {
        // Screen is wider than video (Cut top and bottom)
        mesh.scale.set(1, (screenAspect / videoAspect), 1);
      } else {
        // Screen is taller than video (Cut left and right)
        mesh.scale.set((videoAspect / screenAspect), 1, 1);
      }
      
      renderer.setSize(screenW, screenH);
    };
    
    const resizeObserver = new ResizeObserver(updateCover);
    resizeObserver.observe(container);
    video.addEventListener('loadedmetadata', updateCover);

      // 4. Map scroll progress to target video time
      // Scene 1: 0s to 1.17s
      // Scene 2: 1.17s to 4.00s
      // Scene 3: 4.00s to 6.14s
      const mapProgressToTime = (p: number) => {
        // Hero (0.00-0.16) and Hunter (0.16-0.40) map to Scene 1
        if (p < 0.40) {
          return (p / 0.40) * 1.17;
        } 
        // Temple (0.40-0.62) maps to Scene 2
        else if (p < 0.62) {
          return 1.17 + ((p - 0.40) / 0.22) * (4.00 - 1.17);
        } 
        // Blade, Concept, CTA (0.62-1.00) maps to Scene 3
        else {
          return 4.00 + ((p - 0.62) / 0.38) * (6.14 - 4.00);
        }
      };

    // 5. Main Animation Frame Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const targetTime = mapProgressToTime(scrollProgressRef.current);
      
      // Smooth lerp for Apple-style scrubbing momentum
      currentVideoTimeRef.current += (targetTime - currentVideoTimeRef.current) * 0.08;

      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        video.currentTime = currentVideoTimeRef.current;
        // IMPORTANT: Tell Three.js that the video texture needs to be updated 
        // every frame we scrub, otherwise it stays black/frozen
        videoTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      video.removeEventListener('loadedmetadata', updateCover);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div id="video-layer-outer" className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#050608] z-0">
      {/* Visually hidden video element to drive the WebGL texture. 
          Using opacity 0.001 and full size ensures the browser's compositor 
          doesn't pause hardware decoding (which happens on opacity 0 or display:none). */}
      <video
        ref={videoRef}
        className="fixed top-0 left-0 w-full h-full -z-50 opacity-[0.001] pointer-events-none"
        playsInline
        muted
        preload="auto"
      >
        <source src={`${import.meta.env.BASE_URL}videos/demo.webm`} type="video/webm" />
        <source src={`${import.meta.env.BASE_URL}videos/demo.mp4`} type="video/mp4" />
      </video>
      
      {/* WebGL Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full opacity-90 transition-opacity duration-1000" />
    </div>
  );
}
