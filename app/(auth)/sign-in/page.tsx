"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import * as THREE from "three"
import gsap from "gsap"
import { useState } from "react"
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

const SignInPage = () => {
    const router = useRouter();
const [isLoading, setIsLoading] = useState(false);
const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const sceneRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      if (prefersReducedMotion) {
        gsap.set(".signin-item", { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        ".signin-item",
        {
          opacity: 0,
          y: 35,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
        }
      )

      gsap.fromTo(
        ".signin-visual",
        {
          opacity: 0,
          scale: 0.8,
          rotate: -8,
        },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [])

  // Three.js premium animated background
  useEffect(() => {
     const container = sceneRef.current
 
     if (!container) return
 
     let renderer: THREE.WebGLRenderer
 
     try {
       renderer = new THREE.WebGLRenderer({
         alpha: true,
         antialias: true,
         powerPreference: "low-power",
       })
     } catch (error) {
       console.error("WebGL initialization failed:", error)
       return
     }
 
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
     renderer.setSize(container.clientWidth, container.clientHeight)
 
     container.appendChild(renderer.domElement)
 
     const scene = new THREE.Scene()
 
     const camera = new THREE.PerspectiveCamera(
       55,
       container.clientWidth / container.clientHeight,
       0.1,
       100
     )
 
     camera.position.z = 11
 
     const mainGroup = new THREE.Group()
     scene.add(mainGroup)
 
     // Ambient lighting
     scene.add(new THREE.AmbientLight("#ffffff", 1.5))
 
     const purpleLight = new THREE.PointLight("#a855f7", 45, 30)
     purpleLight.position.set(-4, 3, 5)
     scene.add(purpleLight)
 
     const pinkLight = new THREE.PointLight("#ec4899", 35, 30)
     pinkLight.position.set(4, -3, 4)
     scene.add(pinkLight)
 
     // Central glowing orb
     const orbGeometry = new THREE.IcosahedronGeometry(1.25, 3)
 
     const orbMaterial = new THREE.MeshPhysicalMaterial({
       color: "#a855f7",
       emissive: "#6b21a8",
       emissiveIntensity: 0.65,
       roughness: 0.18,
       metalness: 0.35,
       transparent: true,
       opacity: 0.75,
       wireframe: true,
     })
 
     const orb = new THREE.Mesh(orbGeometry, orbMaterial)
     mainGroup.add(orb)
 
     // Rotating rings
     const ringGeometry = new THREE.TorusGeometry(2, 0.018, 12, 120)
 
     const ringMaterial = new THREE.MeshBasicMaterial({
       color: "#e879f9",
       transparent: true,
       opacity: 0.55,
     })
 
     const rings: THREE.Mesh[] = []
 
     for (let i = 0; i < 3; i++) {
       const ring = new THREE.Mesh(ringGeometry, ringMaterial)
 
       ring.rotation.x = Math.PI / 2.5 + i * 0.65
       ring.rotation.y = i * 0.7
       ring.scale.setScalar(1 + i * 0.2)
 
       mainGroup.add(ring)
       rings.push(ring)
     }
 
     // Particle field
     const particleCount = 450
     const positions = new Float32Array(particleCount * 3)
 
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3
 
       positions[i3] = Math.sin(i * 12.9898) * 7
       positions[i3 + 1] = Math.cos(i * 7.233) * 5
       positions[i3 + 2] = Math.sin(i * 3.17) * 6
     }
 
     const particleGeometry = new THREE.BufferGeometry()
     particleGeometry.setAttribute(
       "position",
       new THREE.BufferAttribute(positions, 3)
     )
 
     const particleMaterial = new THREE.PointsMaterial({
       color: "#d8b4fe",
       size: 0.035,
       transparent: true,
       opacity: 0.75,
       blending: THREE.AdditiveBlending,
       depthWrite: false,
     })
 
     const particles = new THREE.Points(particleGeometry, particleMaterial)
 
     scene.add(particles)
 
     // Floating spheres
     const sphereGeometry = new THREE.SphereGeometry(0.055, 16, 16)
 
     const sphereMaterial = new THREE.MeshBasicMaterial({
       color: "#f0abfc",
     })
 
     const floatingSpheres: THREE.Mesh[] = []
 
     for (let i = 0; i < 18; i++) {
       const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
 
       sphere.position.set(
         Math.sin(i * 2.4) * 7,
         Math.cos(i * 1.8) * 4.5,
         Math.sin(i * 3.2) * 3
       )
 
       // Save original positions
       sphere.userData.baseX = sphere.position.x
       sphere.userData.baseY = sphere.position.y
 
       mainGroup.add(sphere)
       floatingSpheres.push(sphere)
     }
 
     // Three.js Timer
     const timer = new THREE.Timer()
 
     let animationId = 0
     let isVisible = true
     let isDisposed = false
 
     // Animation loop
     const animate = () => {
       if (isDisposed) return
 
       animationId = requestAnimationFrame(animate)
 
       if (!isVisible) return
 
       timer.update()
 
       const time = timer.getElapsed()
 
       // Orb rotation
       orb.rotation.x = time * 0.12
       orb.rotation.y = time * 0.2
 
       // Ring rotation
       rings.forEach((ring, index) => {
         ring.rotation.z = time * (0.12 + index * 0.06)
         ring.rotation.x += 0.0005
       })
 
       // Particle movement
       particles.rotation.y = time * 0.018
       particles.rotation.x = Math.sin(time * 0.15) * 0.08
 
       // Floating spheres
       floatingSpheres.forEach((sphere, index) => {
         sphere.position.y =
           sphere.userData.baseY + Math.sin(time + index) * 0.15
 
         sphere.position.x =
           sphere.userData.baseX + Math.cos(time * 0.5 + index) * 0.1
       })
 
       // Dynamic lighting
       purpleLight.intensity = 38 + Math.sin(time * 1.5) * 8
 
       pinkLight.intensity = 30 + Math.cos(time * 1.2) * 8
 
       // Main group movement
       mainGroup.rotation.y = Math.sin(time * 0.15) * 0.12
 
       renderer.render(scene, camera)
     }
 
     animate()
 
     // Responsive resize
     const resizeObserver = new ResizeObserver(() => {
       const width = container.clientWidth
       const height = container.clientHeight
 
       if (!width || !height || isDisposed) return
 
       camera.aspect = width / height
       camera.updateProjectionMatrix()
 
       renderer.setSize(width, height)
     })
 
     resizeObserver.observe(container)
 
     // Visibility observer
     const visibilityObserver = new IntersectionObserver(([entry]) => {
       isVisible = entry.isIntersecting
 
       // Reset timer when animation becomes visible again
       if (isVisible) {
         timer.reset()
       }
     })
 
     visibilityObserver.observe(container)
 
     // Cleanup
     return () => {
       isDisposed = true
 
       cancelAnimationFrame(animationId)
 
       resizeObserver.disconnect()
       visibilityObserver.disconnect()
 
       timer.dispose()
 
       orbGeometry.dispose()
       orbMaterial.dispose()
 
       ringGeometry.dispose()
       ringMaterial.dispose()
 
       particleGeometry.dispose()
       particleMaterial.dispose()
 
       sphereGeometry.dispose()
       sphereMaterial.dispose()
 
       scene.remove(mainGroup)
       scene.remove(particles)
       scene.remove(purpleLight)
       scene.remove(pinkLight)
 
       renderer.dispose()
       renderer.domElement.remove()
     }
   }, [])

   const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isLoading) return;

  setIsLoading(true);

  try {
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password.");
      return;
    }

    const { error } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe: true,
      callbackURL: "/",
    });

    if (error) {
      toast.error(error.message || "Invalid email or password.");
      return;
    }

    toast.success("Login successful.");

    router.push("/");
    router.refresh();

  } catch (error) {
    console.error("Sign in error:", error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};



const handleGoogleAuth = async () => {
  if (isGoogleLoading) return;

  setIsGoogleLoading(true);

  try {
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: "/",
    });

    if (error) {
      toast.error(error.message || "Google authentication failed.");
      setIsGoogleLoading(false);
    }
  } catch (error) {
    console.error("Google authentication error:", error);
    toast.error("Unable to continue with Google. Please try again.");
    setIsGoogleLoading(false);
  }
};


  return (
    <main
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#100526] text-white"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 -left-40 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-pink-500/15 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10" />
      </div>

      {/* Three.js background */}
      <div
        ref={sceneRef}
        className="pointer-events-none absolute inset-0 opacity-40"
      />

      {/* Navbar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-purple-200 transition hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="m15 18-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* Main content */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-5 pt-6 pb-12 sm:px-8 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="order-2 mx-auto w-full max-w-xl text-center lg:order-1 lg:mx-0 lg:text-left">
            <div className="signin-item mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-purple-200 uppercase sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#e879f9]" />
              Your learning journey starts here
            </div>

            <h1 className="signin-item text-4xl leading-[1.12] font-black tracking-tight sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
              Welcome
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Back!
              </span>
            </h1>

            <p className="signin-item mx-auto mt-6 max-w-md text-sm leading-7 text-purple-200/70 sm:text-base lg:mx-0">
              Your next learning opportunity is just a step away. Sign in to
              connect with expert tutors and continue your journey toward
              success.
            </p>

            {/* Illustration */}
            <div className="signin-visual relative mx-auto mt-10 hidden h-[280px] w-full max-w-md items-center justify-center lg:flex">
              <div className="absolute h-64 w-64 rounded-full border border-purple-400/20" />
              <div className="absolute h-48 w-48 rounded-full border border-fuchsia-400/20" />

              <div className="relative flex h-36 w-36 items-center justify-center rounded-[35px] border border-white/20 bg-gradient-to-br from-purple-500/80 to-fuchsia-600/80 shadow-[0_20px_80px_rgba(168,85,247,0.35)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-16 w-16 text-white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 3 2.5 8 12 13l9.5-5L12 3Z"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 10v5c3.5 3 8.5 3 12 0v-5M21.5 8v7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="absolute top-10 left-5 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
                <span className="text-2xl">📚</span>
              </div>

              <div className="absolute right-8 bottom-8 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
                <span className="text-2xl">🎓</span>
              </div>

              <div className="absolute top-12 right-5 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-xl backdrop-blur-xl">
                <span className="text-xl">✨</span>
              </div>

              <div className="absolute bottom-5 left-10 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-purple-100 shadow-xl backdrop-blur-xl">
                Learn. Grow. Succeed.
              </div>
            </div>
          </div>

          {/* Sign in form */}
          <div className="order-1 mx-auto w-full max-w-[480px] lg:order-2">
            <div className="signin-item relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-9 md:p-10">
              {/* Card glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-purple-500/20 blur-[70px]" />

              <div className="relative">
                <div className="mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4 20c.8-3.5 3.5-5.5 8-5.5s7.2 2 8 5.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">Sign In</h2>

                  <p className="mt-2 text-sm text-purple-200/60">
                    Enter your credentials to access your account.
                  </p>
                </div>

                {/* Form UI */}
                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-purple-100"
                    >
                      Email Address
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#160b30]/70 px-4 transition focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5 shrink-0 text-purple-300/60"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-purple-200/30"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-purple-100"
                      >
                        Password
                      </label>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#160b30]/70 px-4 transition focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-purple-200/30"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-purple-300/60 transition hover:text-white"
                      >
                        {showPassword ? (
                          // Eye off icon
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m3 3 18 18" />
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-3 3.8" />
                            <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" />
                          </svg>
                        ) : (
                          // Eye icon
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-purple-200/70">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-purple-500"
                      />
                      Remember me
                    </label>

                    <span className="text-xs text-purple-200/40">
                      Secure sign in
                    </span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 px-5 py-4 text-sm font-bold shadow-lg shadow-purple-600/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40"
                  >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <span className="relative">{isLoading ? "Signing In..." : "Sign In"}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative h-5 w-5 transition-transform group-hover:translate-x-1"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M5 12h14m-6-6 6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-xs font-medium tracking-wider text-purple-200/40 uppercase">
                    Or continue with
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleLoading}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-purple-400/50 hover:bg-white/10"
                >
                  <svg viewBox="0 0 48 48" className="h-5 w-5">
                    <path
                      fill="#FFC107"
                      d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.6-4.2 6v5h6.8c4-3.7 6-9 6-14.7Z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5c-1.8 1.2-4 1.9-6.7 1.9-5.2 0-9.6-3.5-11.2-8.2H5.8v5.1C9.2 39.6 16 44 24 44Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M12.8 27.9a12 12 0 0 1 0-7.8V15H5.8a20 20 0 0 0 0 18l7-5.1Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 11.9c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4 16 4 9.2 8.4 5.8 15l7 5.1c1.6-4.7 6-8.2 11.2-8.2Z"
                    />
                  </svg>

                  <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
                </button>

                {/* Sign up */}
                <p className="mt-7 text-center text-sm text-purple-200/60">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-bold text-fuchsia-300 transition hover:text-fuchsia-200"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            <p className="signin-item mt-6 text-center text-xs leading-6 text-purple-200/40">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-purple-200/70 underline underline-offset-4 hover:text-white"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-purple-200/70 underline underline-offset-4 hover:text-white"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SignInPage
