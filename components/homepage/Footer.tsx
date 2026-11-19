
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";

const exploreLinks = [
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/about" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // GSAP: Footer entrance animation
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const content = footer.querySelectorAll(".footer-item");

    const ctx = gsap.context(() => {
      gsap.set(content, {
        opacity: 0,
        y: 25,
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.13,
              ease: "power3.out",
            });

            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );

      observer.observe(footer);

      return () => observer.disconnect();
    }, footer);

    return () => ctx.revert();
  }, []);

  // Three.js: Subtle animated footer particles
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

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

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 30;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // Particle geometry
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: "#c58cff",
      size: 0.09,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Soft purple glow
    const glowGeometry = new THREE.SphereGeometry(3, 24, 24);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: "#7e35c5",
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(12, 2, -8);
    scene.add(glow);

    // GSAP particle movement
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const particleAnimation = !reducedMotion
      ? gsap.to(particles.rotation, {
          y: Math.PI * 2,
          x: 0.15,
          duration: 35,
          repeat: -1,
          ease: "none",
        })
      : null;

    const glowAnimation = !reducedMotion
      ? gsap.to(glow.scale, {
          x: 1.5,
          y: 1.5,
          z: 1.5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      : null;

    // Responsive canvas
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Render
    let animationFrame = 0;

    const animate = () => {
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      particleAnimation?.kill();
      glowAnimation?.kill();

      geometry.dispose();
      material.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // GSAP: Link hover animation
  const handleLinkEnter = (element: HTMLAnchorElement) => {
    gsap.to(element, {
      x: 5,
      color: "#ed4cb8",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleLinkLeave = (element: HTMLAnchorElement) => {
    gsap.to(element, {
      x: 0,
      color: "#ded5f2",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden bg-[#1d0b48] px-5 pb-5 pt-10 sm:px-8 sm:pt-12 lg:px-10"
    >
      {/* Three.js Background */}
      <div
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
      />

      <div className="relative mx-auto max-w-[1400px]">

        {/* Footer Main Content */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand */}
          <div className="footer-item">
            <Link
              href="/"
              className="group mb-3 inline-flex items-center gap-2 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Logo Icon */}
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#e0009b] to-[#a900b9] shadow-[0_3px_0_#790078] transition-transform duration-300 group-hover:rotate-6">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14L20 5L37 14L20 23L3 14Z"
                    fill="white"
                  />
                  <path
                    d="M10 18V27C16 32 24 32 30 27V18L20 24L10 18Z"
                    fill="white"
                  />
                  <path
                    d="M36 15V25"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle cx="36" cy="27" r="2" fill="white" />
                </svg>
              </span>

              <span className="text-xl font-extrabold tracking-tight text-[#e8dcff]">
                Mentor<span className="text-[#ed4cb8]">Lagbe</span>
              </span>
            </Link>

            <p className="max-w-[230px] text-sm leading-relaxed text-[#ded5f2]">
              Verified tutors, simple booking, real progress.
            </p>
          </div>

          {/* Explore */}
          <div className="footer-item">
            <h3 className="mb-3 text-sm font-bold text-white">
              Explore
            </h3>

            <ul className="space-y-1.5">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onMouseEnter={(e) => handleLinkEnter(e.currentTarget)}
                    onMouseLeave={(e) => handleLinkLeave(e.currentTarget)}
                    className="inline-block text-sm text-[#ded5f2] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-item">
            <h3 className="mb-3 text-sm font-bold text-white">
              Contact
            </h3>

            <div className="space-y-1.5 text-sm text-[#ded5f2]">
              <a
                href="mailto:hello@mentorlagbe.com"
                className="block transition-colors duration-300 hover:text-[#ed4cb8]"
              >
                hello@mentorlagbe.com
              </a>

              <a
                href="tel:+8801700000000"
                className="block transition-colors duration-300 hover:text-[#ed4cb8]"
              >
                +880 1700-000000
              </a>

              <p>Dhaka, Bangladesh</p>
            </div>
          </div>

          {/* Social */}
          <div className="footer-item">
            <h3 className="mb-3 text-sm font-bold text-white">
              Follow
            </h3>

            <div className="flex items-center gap-3">

              {/* X Social Link */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit X"
                className="group flex h-9 w-9 items-center justify-center rounded-lg text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:text-[#ed4cb8]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                  aria-hidden="true"
                >
                  <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.38L5.6 22H2.47l7.25-8.29L1.8 2h6.4l4.43 6.76L18.9 2Zm-1.1 18h1.73L7.26 3.89H5.4L17.8 20Z" />
                </svg>
              </a>

            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-item mt-9 border-t border-white/10 pt-4 sm:mt-10">
          <p className="text-xs leading-relaxed text-[#b9a9d5]">
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
