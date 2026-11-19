
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import gsap from "gsap";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ----------------------------------
  // 1. GSAP: Entrance animations
  // ----------------------------------
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll(".hero-item");
      const visual = section.querySelector(".hero-visual");

      if (reducedMotion) {
        gsap.set([items, visual], {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
        });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      timeline
        .fromTo(
          items,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            clearProps: "all",
          }
        )
        .fromTo(
          visual,
          {
            opacity: 0,
            scale: 0.9,
            rotateY: -12,
            y: 20,
          },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            y: 0,
            duration: 0.9,
            clearProps: "transform",
          },
          "-=0.5"
        );
    }, section);

    return () => ctx.revert();
  }, []);

  // ----------------------------------
  // 2. Three.js: 3D Tutor Illustration
  // ----------------------------------
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("WebGL is not available:", error);
      return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff, 0);

    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(3, 5, 8);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xd7b4ff, 25);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    // Separate groups prevent animation conflicts:
    // floatGroup = vertical floating
    // idleGroup = continuous gentle rotation
    // interactionGroup = mouse movement
    const floatGroup = new THREE.Group();
    const idleGroup = new THREE.Group();
    const interactionGroup = new THREE.Group();

    scene.add(floatGroup);
    floatGroup.add(idleGroup);
    idleGroup.add(interactionGroup);

    // Materials
    const materials = {
      purple: new THREE.MeshStandardMaterial({
        color: "#8050ff",
        roughness: 0.35,
      }),
      pink: new THREE.MeshStandardMaterial({
        color: "#ed4db9",
        roughness: 0.4,
      }),
      blue: new THREE.MeshStandardMaterial({
        color: "#4c78ff",
        roughness: 0.35,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: "#f5c99f",
        roughness: 0.7,
      }),
      white: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.5,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#34204f",
        roughness: 0.8,
      }),
    };

    // Background circle
    const backgroundCircle = new THREE.Mesh(
      new THREE.CircleGeometry(2.35, 64),
      new THREE.MeshBasicMaterial({ color: "#f2e6ff" })
    );

    backgroundCircle.position.set(0, 0.1, -0.9);
    interactionGroup.add(backgroundCircle);

    // Helper: add a sphere
    const addSphere = (
      radius: number,
      material: THREE.Material,
      position: [number, number, number],
      scale: [number, number, number] = [1, 1, 1]
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        material
      );

      mesh.position.set(...position);
      mesh.scale.set(...scale);
      interactionGroup.add(mesh);

      return mesh;
    };

    // Tutor's body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.62, 1.05, 8, 24),
      materials.pink
    );

    body.position.set(0, -0.35, 0.15);
    interactionGroup.add(body);

    // Head
    addSphere(
      0.53,
      materials.skin,
      [0, 1.1, 0.2],
      [1, 1.05, 0.85]
    );

    // Hair
    addSphere(
      0.48,
      materials.dark,
      [0, 1.48, 0.05],
      [1.03, 0.48, 0.82]
    );

    // Graduation cap
    const capShape = new THREE.Shape();
    capShape.moveTo(-0.95, 0);
    capShape.lineTo(0, 0.48);
    capShape.lineTo(0.95, 0);
    capShape.lineTo(0, -0.48);
    capShape.closePath();

    const capGeometry = new THREE.ExtrudeGeometry(capShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });

    const cap = new THREE.Mesh(capGeometry, materials.blue);
    cap.position.set(0, 1.45, 0.65);
    interactionGroup.add(cap);

    // Tassel
    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.55, 12),
      materials.white
    );

    tassel.position.set(0.75, 1.25, 0.75);
    tassel.rotation.z = -0.35;
    interactionGroup.add(tassel);

    // Books
    const createBook = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      y: number,
      z: number
    ) => {
      const book = new THREE.Mesh(
        new RoundedBoxGeometry(width, height, depth, 5, 0.07),
        material
      );

      book.position.set(0, y, z);
      interactionGroup.add(book);

      return book;
    };

    createBook(2.9, 0.42, 0.42, materials.purple, -0.95, 0.65);
    createBook(3.55, 0.5, 0.42, materials.pink, -1.48, 0.75);
    createBook(3.9, 0.55, 0.42, materials.blue, -2.05, 0.85);

    // Book detail
    const bookLine = new THREE.Mesh(
      new RoundedBoxGeometry(2.6, 0.035, 0.025, 3, 0.01),
      materials.white
    );

    bookLine.position.set(0, -1.48, 0.98);
    interactionGroup.add(bookLine);

    // Initial rotation
    interactionGroup.rotation.set(-0.05, -0.12, 0);

    // ----------------------------------
    // 3. GSAP: Independent 3D animations
    // ----------------------------------
    const animationTweens: gsap.core.Tween[] = [];

    if (!reducedMotion) {
      animationTweens.push(
        gsap.to(floatGroup.position, {
          y: 0.12,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }),

        gsap.to(idleGroup.rotation, {
          y: 0.12,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
    }

    // Mouse interaction: only controls interactionGroup
    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType !== "mouse") return;

      const rect = container.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(interactionGroup.rotation, {
        x: -0.05 - y * 0.2,
        y: -0.12 + x * 0.2,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handlePointerLeave = () => {
      if (reducedMotion) return;

      gsap.to(interactionGroup.rotation, {
        x: -0.05,
        y: -0.12,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // ----------------------------------
    // 4. Responsive camera and renderer
    // ----------------------------------
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      const aspect = width / height;

      camera.aspect = aspect;

      // Increase camera distance on narrow screens
      camera.position.z =
        aspect < 0.8 ? 11 :
        aspect < 1.15 ? 9.5 :
        8.5;

      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // ----------------------------------
    // 5. Render loop
    // ----------------------------------
    let animationFrame = 0;
    let isVisible = true;

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });

    visibilityObserver.observe(container);

    const render = () => {
      if (isVisible) {
        renderer.render(scene, camera);
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();

    // ----------------------------------
    // 6. Cleanup
    // ----------------------------------
    return () => {
      cancelAnimationFrame(animationFrame);

      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      animationTweens.forEach((tween) => tween.kill());

      gsap.killTweensOf(interactionGroup.rotation);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const meshMaterials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          meshMaterials.forEach((material) => material.dispose());
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-gradient-to-r from-[#c40b91] via-[#74169c] to-[#241052] px-5 py-14 sm:px-8 sm:py-16 md:py-20 lg:px-16 lg:py-20"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 -z-10 h-72 w-72 rounded-full bg-pink-400/20 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-96 w-96 rounded-full bg-purple-300/20 blur-[110px]"
      />

      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">

        {/* Left Content */}
        <div className="relative z-10 text-center lg:text-left">

          {/* Badge */}
          <div className="hero-item mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#eaff8a] shadow-[0_0_10px_#eaff8a]" />
            Smart Tuition &amp; Mentorship Platform
          </div>

          {/* Heading */}
          <h1 className="hero-item mx-auto max-w-[700px] text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:mx-0 lg:text-[62px] xl:text-[68px]">
            Find Your Ideal Tutor or{" "}
            <span className="text-[#ffd5f2]">Mentorship Batch</span>{" "}
            Today
          </h1>

          {/* Description */}
          <p className="hero-item mx-auto mt-5 max-w-[590px] text-base leading-relaxed text-white/85 sm:mt-6 sm:text-lg lg:mx-0 lg:text-xl">
            Connect with verified tutors, discover the right learning
            opportunities, and take the next step toward your goals.
          </p>

          {/* Stats */}
          <div className="hero-item mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-semibold text-white/90 sm:text-sm lg:justify-start">
            <span>4.9 Average Rating</span>
            <span className="text-white/50">•</span>
            <span>1,200+ Tutors</span>
            <span className="text-white/50">•</span>
            <span>40+ Subjects</span>
          </div>

          {/* CTA Buttons */}
          <div className="hero-item mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">

            <Link
              href="/tuitions"
              className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-[#55169b] shadow-[0_6px_0_rgba(75,20,120,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(75,20,120,0.35),0_15px_25px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none sm:w-auto"
            >
              Browse Tuitions
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/sign-up"
              className="flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-white/80 bg-white/5 px-7 py-3 font-bold text-white shadow-[0_5px_0_rgba(40,10,80,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-[0_9px_0_rgba(40,10,80,0.35)] active:translate-y-1 active:shadow-none sm:w-auto"
            >
              Become a Tutor
            </Link>

          </div>
        </div>

        {/* Right 3D Illustration */}
        <div className="hero-visual relative mx-auto w-full max-w-[620px]">

          <div className="relative aspect-[1.15/1] min-h-[300px] w-full overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[0_25px_70px_rgba(20,5,50,0.28)] sm:aspect-[1.3/1] sm:min-h-[390px] sm:rounded-[30px] lg:min-h-[440px]">

            {/* Three.js canvas */}
            <div
              ref={canvasRef}
              className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
              role="img"
              aria-label="Interactive three-dimensional illustration of a tutor wearing a graduation cap with books"
            />

            {/* Bottom label */}
            <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center sm:bottom-6">
              <span className="rounded-full border border-[#eadbff] bg-[#f5edff]/95 px-4 py-2 text-xs font-bold text-[#6b35c5] shadow-sm backdrop-blur-md sm:text-sm">
                Learn • Grow • Succeed
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
