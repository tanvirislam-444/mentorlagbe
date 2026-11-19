
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

const steps = [
  {
    number: "01",
    title: "Sign up",
    description: "Choose Student or Tutor.",
  },
  {
    number: "02",
    title: "Search or post",
    description: "Filter listings, or publish a batch.",
  },
  {
    number: "03",
    title: "Apply and accept",
    description: "Tutors review each application.",
  },
  {
    number: "04",
    title: "Start learning",
    description: "Track status in your dashboard.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // GSAP: Scroll entrance and card hover animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>(".step-card");
    const heading = section.querySelector(".section-heading");
    const subtitle = section.querySelector(".section-subtitle");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([heading, subtitle, cards], { opacity: 1, y: 0 });
        return;
      }

      gsap.set([heading, subtitle, cards], {
        opacity: 0,
        y: 25,
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.to([heading, subtitle], {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
            });

            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.15,
              delay: 0.2,
              ease: "power3.out",
            });

            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(section);

      // 3D hover effect
      const handlePointerMove = (event: PointerEvent) => {
        const card = event.currentTarget as HTMLElement;
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 7;
        const rotateX = (0.5 - y) * 7;

        gsap.to(card, {
          rotateX,
          rotateY,
          y: -7,
          scale: 1.015,
          transformPerspective: 900,
          transformOrigin: "center center",
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const handlePointerLeave = (event: PointerEvent) => {
        const card = event.currentTarget as HTMLElement;

        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      cards.forEach((card) => {
        card.addEventListener("pointermove", handlePointerMove);
        card.addEventListener("pointerleave", handlePointerLeave);
      });

      // Cleanup
      return () => {
        observer.disconnect();

        cards.forEach((card) => {
          card.removeEventListener("pointermove", handlePointerMove);
          card.removeEventListener("pointerleave", handlePointerLeave);
        });
      };
    }, section);

    return () => ctx.revert();
  }, []);

  // Three.js: Animated 3D decorative orbs
  useEffect(() => {
    const container = canvasRef.current;
    const section = sectionRef.current;

    if (!container || !section) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      0,
      1,
      1,
      0,
      0.1,
      100
    );

    camera.position.z = 10;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xb58cff, 4);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Create one 3D orb for each card
    const orbs: THREE.Mesh[] = [];

    const orbGeometry = new THREE.IcosahedronGeometry(11, 2);

    for (let i = 0; i < 4; i++) {
      const material = new THREE.MeshPhysicalMaterial({
        color: i % 2 === 0 ? "#a87aff" : "#e2a6ec",
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
        metalness: 0.35,
        clearcoat: 1,
      });

      const orb = new THREE.Mesh(orbGeometry, material);

      scene.add(orb);
      orbs.push(orb);

      // Individual floating and rotation animations
      gsap.to(orb.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: 8 + i * 2,
        repeat: -1,
        ease: "none",
      });

      gsap.to(orb.position, {
        y: 5,
        duration: 2 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2,
      });
    }

    // Position the orbs relative to each card
    const updatePositions = () => {
      const sectionRect = section.getBoundingClientRect();
      const width = section.clientWidth;
      const height = section.clientHeight;

      if (!width || !height) return;

      camera.left = 0;
      camera.right = width;
      camera.top = height;
      camera.bottom = 0;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      const cards = section.querySelectorAll<HTMLElement>(".step-card");

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();

        const x = rect.right - sectionRect.left - 27;
        const y = rect.top - sectionRect.top + 28;

        orbs[index].position.set(x, height - y, 1);
      });
    };

    const resizeObserver = new ResizeObserver(updatePositions);
    resizeObserver.observe(section);

    // Also update after layout changes
    updatePositions();

    // Render loop
    let animationFrame = 0;

    const render = () => {
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      orbs.forEach((orb) => {
        gsap.killTweensOf(orb.position);
        gsap.killTweensOf(orb.rotation);
        (orb.material as THREE.Material).dispose();
      });

      orbGeometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f6efff] px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Section Heading */}
        <div className="relative z-10 mb-6">
          <h2 className="section-heading text-2xl font-extrabold tracking-tight text-[#241052] sm:text-3xl">
            How MentorLagbe Works
          </h2>

          <p className="section-subtitle mt-1.5 text-sm text-[#68627b] sm:text-base">
            Four simple steps from search to first class.
          </p>
        </div>

        {/* Cards and Three.js Canvas */}
        <div className="relative">

          {/* Three.js decorative canvas */}
          <div
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          />

          {/* Step Cards */}
          <div className="relative z-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="step-card relative min-h-[87px] rounded-xl border border-[#eee5fa] bg-white px-4 py-4 shadow-[0_8px_25px_rgba(54,26,100,0.07)] transition-shadow duration-300 hover:shadow-[0_16px_35px_rgba(75,35,130,0.13)] sm:min-h-[87px] sm:px-4"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative z-20">
                  <span className="block text-[27px] font-extrabold leading-none tracking-tight text-[#241052] sm:text-[28px]">
                    {step.number}
                  </span>

                  <h3 className="mt-1 text-[13px] font-bold leading-tight text-[#33334a]">
                    {step.title}
                  </h3>

                  <p className="mt-0.5 text-[11px] leading-snug text-[#68627b] sm:text-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
