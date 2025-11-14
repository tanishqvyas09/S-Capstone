import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useTheme } from '../contexts/ThemeContext';

interface KnowledgeOrbProps {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  colorIndex: number;
}

const KnowledgeNetwork3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
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
        orbs: [0x14B8A6, 0xF59E0B, 0x0EA5E9],
        particles: 0x14B8A6,
        lines: 0x14B8A6,
        bg: 0x0a0a0a,
        fog: 0x0a0a0a
      },
      light: {
        orbs: [0x0D9488, 0xF97316, 0x3B82F6],
        particles: 0x0D9488,
        lines: 0x0D9488,
        bg: 0xF9FAFB,
        fog: 0xF9FAFB
      }
    };

    const currentColors = themeColors[theme];

    scene.background = new THREE.Color(currentColors.bg);
    scene.fog = new THREE.Fog(currentColors.fog, 500, 2000);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      3000
    );
    camera.position.z = 1000;
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

    // Create knowledge orbs
    const orbsData: KnowledgeOrbProps[] = [];
    const orbMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 40; i++) {
      const size = Math.random() * 40 + 20;
      const colorIndex = Math.floor(Math.random() * 3);
      
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: currentColors.orbs[colorIndex],
        transparent: true,
        opacity: 0.6
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 1000 - 500
      );
      
      scene.add(mesh);
      orbMeshes.push(mesh);

      orbsData.push({
        position: mesh.position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3
        ),
        size,
        colorIndex
      });

      // Add inner glow
      const glowGeometry = new THREE.SphereGeometry(size * 0.7, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: currentColors.orbs[colorIndex],
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glow);

      // Pulsing animation
      gsap.to(material, {
        opacity: 1.0,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
    }

    orbsRef.current = orbMeshes;

    // Create particle field
    const particleCount = 250;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 1] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 2] = Math.random() * 1000 - 500;
      
      particleVelocities.push(
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.3 + 0.1, // Upward drift
        (Math.random() - 0.5) * 0.2
      );
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: currentColors.particles,
      size: 3,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Connection lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: currentColors.lines,
      transparent: true,
      opacity: 0.2
    });

    // Mouse movement handler
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Update orbs
      orbMeshes.forEach((orb, i) => {
        const data = orbsData[i];
        
        // Sine wave motion
        orb.position.x += data.velocity.x + Math.sin(time + i) * 0.1;
        orb.position.y += data.velocity.y + Math.cos(time + i) * 0.1;
        orb.position.z += data.velocity.z;

        // Rotation
        orb.rotation.x += 0.001;
        orb.rotation.y += 0.002;

        // Boundary checking
        if (Math.abs(orb.position.x) > 1000) data.velocity.x *= -1;
        if (Math.abs(orb.position.y) > 1000) data.velocity.y *= -1;
        if (Math.abs(orb.position.z) > 500) data.velocity.z *= -1;

        // Mouse parallax
        orb.position.x += mouseRef.current.x * 20 * 0.02;
        orb.position.y += mouseRef.current.y * 20 * 0.02;
      });

      // Update particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i * 3];
        positions[i * 3 + 1] += particleVelocities[i * 3 + 1];
        positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

        // Reset particles that go too far
        if (positions[i * 3 + 1] > 1000) {
          positions[i * 3 + 1] = -1000;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Draw connection lines
      const existingLines = scene.children.filter((child: THREE.Object3D) => child instanceof THREE.Line);
      existingLines.forEach((line: THREE.Object3D) => scene.remove(line));

      for (let i = 0; i < orbMeshes.length; i++) {
        for (let j = i + 1; j < orbMeshes.length; j++) {
          const distance = orbMeshes[i].position.distanceTo(orbMeshes[j].position);
          
          if (distance < 250) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              orbMeshes[i].position,
              orbMeshes[j].position
            ]);
            
            const opacity = (1 - distance / 250) * 0.3;
            const lineM = lineMaterial.clone();
            lineM.opacity = opacity;
            
            const line = new THREE.Line(lineGeometry, lineM);
            scene.add(line);
          }
        }
      }

      // Camera slight movement
      camera.position.x += (mouseRef.current.x * 50 - camera.position.x) * 0.01;
      camera.position.y += (mouseRef.current.y * 50 - camera.position.y) * 0.01;

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

    // Handle visibility change (pause when tab hidden)
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      // Dispose of geometries and materials
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

export default KnowledgeNetwork3D;
