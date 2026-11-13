import * as THREE from "three";
import React, { useRef, useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sizes = { width: window.innerWidth, height: window.innerHeight };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 6;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor("#07040c");
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Globe
    const texture = new THREE.TextureLoader().load("/g11.svg");
    const earthGeometry = new THREE.SphereGeometry(2.8, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.x = Math.PI / 8;
    earth.rotation.y = Math.PI / 8;
    scene.add(earth);

    // Particles: one Points object with a soft round sprite
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 4.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const ctx = dot.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.8)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const dotTexture = new THREE.CanvasTexture(dot);

    const particlesMaterial = new THREE.PointsMaterial({
      map: dotTexture,
      color: "#c27bff",
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;

    const clock = new THREE.Clock();
    let frame = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      camera.position.x = Math.cos(t * 0.5) * 6;
      camera.position.z = Math.sin(t * 0.5) * 6;
      particles.rotation.y = t * 0.03;
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      texture.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      dotTexture.dispose();
    };
  }, []);

  return (
    <div className="canvas-container" aria-hidden="true">
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  );
}

export default ThreeScene;
