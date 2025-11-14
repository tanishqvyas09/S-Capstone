import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useTheme } from '../contexts/ThemeContext';

const PortalGateway3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Check if mobile or reduced motion
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || prefersReducedMotion) {
      return; // Skip 3D on mobile/reduced motion
    }

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const themeColors = {
      dark: {
        ring: 0x14B8A6,
        ringSecondary: 0xF59E0B,
        particles: 0x14B8A6,
        grid: 0x14B8A6,
        bg: 0x0a0a0a,
        fog: 0x0a0a0a
      },
      light: {
        ring: 0x0D9488,
        ringSecondary: 0xF97316,
        particles: 0x0D9488,
        grid: 0x0D9488,
        bg: 0xF9FAFB,
        fog: 0xF9FAFB
      }
    };

    const currentColors = themeColors[theme];

    scene.background = new THREE.Color(currentColors.bg);
    scene.fog = new THREE.Fog(currentColors.fog, 500, 1500);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.z = 600;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Create rotating rings
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { radius: 200, tube: 4, color: currentColors.ring },
      { radius: 150, tube: 3, color: currentColors.ringSecondary },
      { radius: 100, tube: 2, color: currentColors.ring }
    ];

    ringConfigs.forEach((config, index) => {
      const geometry = new THREE.TorusGeometry(config.radius, config.tube, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: config.color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 6;
      scene.add(ring);
      rings.push(ring);

      // Add glow effect
      const glowGeometry = new THREE.TorusGeometry(config.radius, config.tube * 1.5, 16, 100);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.rotation.x = Math.PI / 6;
      ring.add(glow);

      // Pulsing animation
      gsap.to(material, {
        opacity: 0.8,
        duration: 2 + index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Create particle vortex
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData: Array<{ angle: number; radius: number; speed: number }> = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 300 + 100;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      particleData.push({
        angle,
        radius,
        speed: Math.random() * 0.02 + 0.01
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: currentColors.particles,
      size: 4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create energy waves
    const waves: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const waveGeometry = new THREE.RingGeometry(10, 15, 64);
      const waveMaterial = new THREE.MeshBasicMaterial({
        color: currentColors.ring,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      
      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
      scene.add(wave);
      waves.push(wave);

      // Expanding wave animation
      const tl = gsap.timeline({ repeat: -1, delay: i * 0.5 });
      tl.to(wave.scale, {
        x: 30,
        y: 30,
        duration: 2,
        ease: 'none'
      }, 0);
      tl.to(waveMaterial, {
        opacity: 0.8,
        duration: 0.3,
        ease: 'power2.out'
      }, 0);
      tl.to(waveMaterial, {
        opacity: 0,
        duration: 1.7,
        ease: 'power2.in'
      }, 0.3);
      tl.to(wave.scale, {
        x: 1,
        y: 1,
        duration: 0,
      }, 2);
    }

    // Create background grid
    const gridSize = 1000;
    const gridDivisions = 20;
    const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: currentColors.grid,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 3;
    grid.position.z = -200;
    grid.position.y = -300;
    scene.add(grid);

    // Animation loop
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate rings at different speeds
      rings.forEach((ring, index) => {
        ring.rotation.y += 0.005 * (index + 1);
        ring.rotation.z += 0.003 * (index % 2 ? 1 : -1);
      });

      // Update particle vortex
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        
        // Spiral inward
        data.angle += data.speed;
        data.radius -= 0.5;
        
        // Reset at edge if reached center
        if (data.radius < 20) {
          data.radius = Math.random() * 100 + 250;
          data.angle = Math.random() * Math.PI * 2;
        }
        
        positions[i * 3] = Math.cos(data.angle) * data.radius;
        positions[i * 3 + 1] = Math.sin(data.angle) * data.radius;
        
        // Size decreases toward center
        const scale = data.radius / 300;
        particlesMaterial.size = 4 * scale;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Wave distortion on grid
      const gridPositions = grid.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < gridPositions.length; i += 3) {
        const x = gridPositions[i];
        const y = gridPositions[i + 1];
        const distance = Math.sqrt(x * x + y * y);
        gridPositions[i + 2] = Math.sin(distance * 0.02 + time) * 20;
      }
      grid.geometry.attributes.position.needsUpdate = true;

      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.1) * 30;
      camera.position.y = Math.cos(time * 0.15) * 20;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !camera || !renderer) return;
      
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      renderer?.dispose();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default PortalGateway3D;
