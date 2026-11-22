
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/about" },
];

export default function Navbar() {
const [profileMenuOpen, setProfileMenuOpen] = useState(false);

const router = useRouter();

const { data: session, isPending } = useSession();

const user = session?.user;

const userName = user?.name || "User";
const userImage = user?.image;
const userRole = (user as typeof user & { role?: string })?.role || "student";

const roleLabel =
  userRole.charAt(0).toUpperCase() + userRole.slice(1);

const dashboardPath =
  userRole === "admin"
    ? "/admin-dashboard"
    : userRole === "tutor"
      ? "/tutor-dashboard"
      : "/student-dashboard";
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoCanvasRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // --------------------------------
  // GSAP: Navbar entrance animation
  // --------------------------------
 useEffect(() => {
  if (isPending) return;

  const header = headerRef.current;
  const nav = navRef.current;

  if (!header || !nav) return;

  const ctx = gsap.context(() => {
    const logo = nav.querySelector(".brand-logo");
    const links = nav.querySelectorAll(".nav-link");
    const buttons = nav.querySelectorAll(".auth-btn");
    const menuButton = nav.querySelector(".menu-toggle");

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    timeline.fromTo(
      header,
      { y: -35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }
    );

    if (logo) {
      timeline.fromTo(
        logo,
        { opacity: 0, x: -25, rotateY: -25 },
        { opacity: 1, x: 0, rotateY: 0, duration: 0.6 },
        "-=0.3"
      );
    }

    if (links.length) {
      timeline.fromTo(
        links,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 },
        "-=0.3"
      );
    }

    if (buttons.length) {
      timeline.fromTo(
        buttons,
        { opacity: 0, y: -12, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.4 },
        "-=0.3"
      );
    }

    if (menuButton) {
      timeline.fromTo(
        menuButton,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3 },
        "-=0.3"
      );
    }
  }, nav);

  return () => {
    ctx.revert();
  };
}, [isPending]);

  // --------------------------------
  // Three.js: 3D Graduation Cap Logo
  // --------------------------------
  useEffect(() => {
    const container = logoCanvasRef.current;

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

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 4.5;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(44, 44);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(2, 3, 5);
    scene.add(directionalLight);

    // Graduation cap group
    const capGroup = new THREE.Group();
    scene.add(capGroup);

    // Cap diamond shape
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
      bevelSize: 0.035,
      bevelThickness: 0.035,
    });

    const capMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.3,
      metalness: 0.15,
    });

    const cap = new THREE.Mesh(capGeometry, capMaterial);
    capGroup.add(cap);

    // Cap bottom
    const baseGeometry = new THREE.BoxGeometry(0.95, 0.1, 0.55);

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: "#f4dfff",
      roughness: 0.4,
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -0.23, -0.03);
    capGroup.add(base);

    // Tassel
    const tasselMaterial = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.35,
    });

    const tassel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.55, 12),
      tasselMaterial
    );

    tassel.position.set(0.72, -0.12, 0.15);
    tassel.rotation.z = -0.35;
    capGroup.add(tassel);

    const tasselEnd = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      tasselMaterial
    );

    tasselEnd.position.set(0.82, -0.39, 0.15);
    capGroup.add(tasselEnd);

    capGroup.rotation.set(-0.15, -0.2, 0);
    capGroup.scale.set(0.85, 0.85, 0.85);

    // Reduced motion preference
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // GSAP 3D rotation
    const rotationAnimation = !reducedMotion
      ? gsap.to(capGroup.rotation, {
          y: Math.PI * 2,
          duration: 7,
          repeat: -1,
          ease: "none",
        })
      : null;

    // Mouse interaction
    const handlePointerMove = (event: PointerEvent) => {
      if (reducedMotion) return;

      const rect = container.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(capGroup.rotation, {
        x: -y * 0.6,
        y: x * 0.6,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handlePointerLeave = () => {
      if (reducedMotion) return;

      gsap.to(capGroup.rotation, {
        x: -0.15,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

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

    // Render loop
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

      rotationAnimation?.kill();

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      capGeometry.dispose();
      capMaterial.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();

      tassel.geometry.dispose();
      tasselMaterial.dispose();

      tasselEnd.geometry.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // --------------------------------
  // GSAP: Mobile menu animation
  // --------------------------------
  useEffect(() => {
    const menu = mobileMenuRef.current;

    if (!menu) return;

    const menuLinks = menu.querySelectorAll(".mobile-link");
    const authButtons = menu.querySelectorAll(".mobile-auth-btn");

    if (menuOpen) {
      gsap.set(menu, {
        display: "block",
        height: 0,
        opacity: 0,
        overflow: "hidden",
      });

      gsap.to(menu, {
        height: "auto",
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(menu, { height: "auto", overflow: "visible" });
        },
      });

      gsap.fromTo(
        [...menuLinks, ...authButtons],
        { opacity: 0, x: -15 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.35,
          delay: 0.1,
          ease: "power2.out",
        }
      );
    } else {
      gsap.to(menu, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(menu, { display: "none" });
        },
      });
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = async () => {
  try {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setProfileMenuOpen(false);
          setMenuOpen(false);
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-[#1d0b48] shadow-[0_8px_25px_rgba(10,2,35,0.3)]"
    >
      <nav
        ref={navRef}
        className="mx-auto flex min-h-[82px] max-w-[1500px] items-center justify-between px-5 md:px-10 lg:px-16"
      >
        {/* Logo */}
        <Link
          href="/"
          className="brand-logo group flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#e0009b] to-[#a900b9] shadow-[0_5px_0_#790078,0_9px_18px_rgba(222,0,165,0.3)] transition-all duration-300 group-hover:rotate-6 group-hover:shadow-[0_8px_0_#790078,0_14px_22px_rgba(222,0,165,0.4)]">
            <span
              ref={logoCanvasRef}
              className="absolute inset-0 h-full w-full"
            />
          </span>

          <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-white sm:text-2xl">
            Mentor<span className="text-[#ed4cb8]">Lagbe</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="nav-link text-[18px] font-medium text-[#e5dcf7] transition-all duration-300 hover:-translate-y-1 hover:text-[#f34fbd] hover:drop-shadow-[0_5px_8px_rgba(243,79,189,0.4)]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication */}
<div className="hidden items-center gap-4 lg:flex">
  {isPending ? (
    <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
  ) : user ? (
    <div className="relative">
      <button
        type="button"
        onClick={() => setProfileMenuOpen((prev) => !prev)}
        className="auth-btn flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-2 pr-4 transition-all hover:bg-white/15"
      >
        {/* Avatar */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-pink-400 bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              fill
              unoptimized
              sizes="40px"
              className="object-cover"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Name and Role */}
        <div className="flex flex-col items-start">
          <span className="max-w-[120px] truncate text-sm font-bold text-white">
            {userName}
          </span>

          <span className="text-xs font-semibold text-pink-300">
            {roleLabel}
          </span>
        </div>

        <svg
          className={`h-4 w-4 text-white transition-transform ${
            profileMenuOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {/* Profile Dropdown */}
      {profileMenuOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-purple-400/20 bg-[#24104e] p-2 shadow-[0_15px_45px_rgba(0,0,0,0.4)]">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate font-bold text-white">
              {userName}
            </p>
            <p className="truncate text-xs text-purple-200">
              {user.email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-pink-500/15 px-3 py-1 text-xs font-bold text-pink-300">
              {roleLabel}
            </span>
          </div>

          <Link
            href={dashboardPath}
            onClick={() => setProfileMenuOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-purple-100 transition hover:bg-white/10 hover:text-pink-300"
          >
            <span>▦</span>
            Dashboard
          </Link>

          <Link
            href="/profile"
            onClick={() => setProfileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-purple-100 transition hover:bg-white/10 hover:text-pink-300"
          >
            <span>⚙</span>
            Update Profile
          </Link>

          <div className="my-2 border-t border-white/10" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <span>↪</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  ) : (
    <>
      <Link
        href="/sign-in"
        className="auth-btn flex h-10 min-w-[90px] items-center justify-center rounded-xl border-2 border-[#e6d8ff] bg-gradient-to-br from-[#281057] to-[#1b093f] px-6 font-bold text-white shadow-[0_5px_0_#10042e] transition-all duration-300 hover:-translate-y-1"
      >
        Sign In
      </Link>

      <Link
        href="/sign-up"
        className="auth-btn flex h-10 min-w-[90px] items-center justify-center rounded-xl border border-[#c000b9] bg-gradient-to-r from-[#df079e] to-[#7516c6] px-6 font-bold text-white shadow-[0_5px_0_#510c92] transition-all duration-300 hover:-translate-y-1"
      >
        Sign Up
      </Link>
    </>
  )}
</div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          className="menu-toggle flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-lg border border-white/20 bg-[#32166b] lg:hidden"
        >
          <span
            className={`h-[2px] w-6 rounded bg-white transition-all duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 rounded bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 rounded bg-white transition-all duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        ref={mobileMenuRef}
        className="hidden overflow-hidden bg-[#1d0b48] lg:hidden"
      >
        <div className="flex flex-col gap-5 border-t border-white/10 px-6 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMenu}
              className="mobile-link font-medium text-[#e5dcf7] transition-colors duration-300 hover:text-[#f34fbd]"
            >
              {link.name}
            </Link>
          ))}

          <div className="border-t border-white/10 pt-5">
  {isPending ? (
    <div className="h-12 animate-pulse rounded-xl bg-white/10" />
  ) : user ? (
    <div className="space-y-3">
      {/* Mobile User Info */}
      <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-pink-400 bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              fill
              unoptimized
              sizes="48px"
              className="object-cover"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-bold text-white">
            {userName}
          </p>
          <span className="text-xs font-semibold text-pink-300">
            {roleLabel}
          </span>
        </div>
      </div>

      <Link
        href={dashboardPath}
        onClick={closeMenu}
        className="mobile-auth-btn block rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15"
      >
        Dashboard
      </Link>

      <Link
        href="/profile"
        onClick={closeMenu}
        className="mobile-auth-btn block rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15"
      >
        Update Profile
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        className="mobile-auth-btn w-full rounded-xl bg-red-500/10 px-4 py-3 text-left font-semibold text-red-300 transition hover:bg-red-500/20"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <div className="flex gap-3">
      <Link
        href="/sign-in"
        onClick={closeMenu}
        className="mobile-auth-btn flex h-11 flex-1 items-center justify-center rounded-xl border-2 border-[#e6d8ff] font-bold text-white shadow-[0_4px_0_#10042e] transition hover:-translate-y-1"
      >
        Sign In
      </Link>

      <Link
        href="/sign-up"
        onClick={closeMenu}
        className="mobile-auth-btn flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#df079e] to-[#7516c6] font-bold text-white shadow-[0_4px_0_#510c92] transition hover:-translate-y-1"
      >
        Sign Up
      </Link>
    </div>
  )}
</div>
        </div>
      </div>
    </header>
  );
}

