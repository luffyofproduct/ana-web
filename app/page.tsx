"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#004a30",
  primaryContainer: "#006442",
  surface: "#ffffff",
  surfaceLow: "#f6f3ee",
  surfaceHigh: "#ebe8e3",
  surfaceHighest: "#e5e2dd",
  onSurface: "#1c1c19",
  onSurfaceVariant: "#44483d",
  tertiary: "#5f3600",
  tertiaryFixed: "#ffdcbd",
  outlineVariant: "#c4c8ba",
};

// ─── Geometric SVG patterns ───────────────────────────────────────────────────

// 8-pointed Islamic star tile
const StarPatternBg = ({ opacity = 0.035, color = C.primary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.8' opacity='1'><polygon points='40,4 47,20 64,20 51,30 56,47 40,37 24,47 29,30 16,20 33,20'/><polygon points='40,74 47,58 64,58 51,50 56,33 40,43 24,33 29,50 16,58 33,58' transform='rotate(180,40,40)'/><line x1='40' y1='0' x2='40' y2='80'/><line x1='0' y1='40' x2='80' y2='40'/></g></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Diamond grid pattern
const DiamondPatternBg = ({ opacity = 0.04, color = C.primary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M30 2 L58 30 L30 58 L2 30 Z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.7'/></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Hexagonal lattice
const HexPatternBg = ({ opacity = 0.04, color = C.tertiary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='80'><polygon points='35,2 67,20 67,56 35,74 3,56 3,20' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.7'/></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Large decorative Arabic numeral / letter as section watermark
function ArabicWatermark({ text, top, right, left, size = "18rem", opacity = 0.045 }: {
  text: string; top?: string; right?: string; left?: string; size?: string; opacity?: number;
}) {
  return (
    <div
      className="arabic"
      style={{
        position: "absolute",
        top,
        right,
        left,
        fontSize: size,
        lineHeight: 1,
        color: C.primary,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        fontWeight: 700,
        zIndex: 0,
      }}
    >
      {text}
    </div>
  );
}

// ─── Gosper curve background ──────────────────────────────────────────────────
function GosperBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let renderer: THREE.WebGLRenderer;
    let animId: number;

    import("three/examples/jsm/utils/GeometryUtils.js").then(({ gosper }) => {
      if (destroyed) return;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 20;

      const scene = new THREE.Scene();

      // Gosper curve — size=1 gives ~2500 points
      const points = gosper(1);
      const geometry = new THREE.BufferGeometry();
      const posAttr = new THREE.Float32BufferAttribute(points, 3);
      geometry.setAttribute("position", posAttr);
      geometry.center();

      const colorAttr = new THREE.BufferAttribute(new Float32Array(posAttr.array.length), 3);
      colorAttr.setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute("color", colorAttr);

      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ vertexColors: true }));
      // Scale to fill viewport — gosper(1) bounding box is roughly 100 units
      line.scale.setScalar(0.25);
      scene.add(line);

      // Design system colors
      const palette = [
        new THREE.Color(0x004a30),  // primary
        new THREE.Color(0x006442),  // primaryContainer
        new THREE.Color(0xc4c8ba),  // outlineVariant
        new THREE.Color(0x5f3600),  // tertiary
        new THREE.Color(0xffdcbd),  // tertiaryFixed
        new THREE.Color(0xebe8e3),  // surfaceHigh
        new THREE.Color(0x004a30),  // loop back to primary
      ];

      let offset = 0;
      const tmp = new THREE.Color();

      function onResize() {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      function animate() {
        if (destroyed) return;

        const count = colorAttr.count;
        for (let i = 0; i < count; i++) {
          const t = (((offset + i) % count) + count) % count / count;
          const idx = t * (palette.length - 1);
          const lo = Math.floor(idx);
          const hi = Math.min(lo + 1, palette.length - 1);
          tmp.lerpColors(palette[lo], palette[hi], idx - lo);
          colorAttr.setXYZ(i, tmp.r, tmp.g, tmp.b);
        }
        colorAttr.needsUpdate = true;
        offset -= 15;

        line.rotation.z += 0.0003;

        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      }
      animate();
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        opacity: 0.15,
      }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ backgroundColor: C.surface, overflowX: "hidden", position: "relative" }}>
      <GosperBackground />
      <Nav />
      <Hero />
      <FeatureDialect />
      <FeatureContent />
      <FeatureStudy />
      <FeaturePractice />
      <Problem />
      <WhoItsFor />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      // Warm parchment-to-white gradient with a subtle green tint at top
      background: "linear-gradient(180deg, rgba(246,243,238,0.92) 0%, rgba(255,255,255,0.75) 100%)",
      // Soft geometric-inspired bottom line using tertiary gold
      borderBottom: `1px solid rgba(95,54,0,0.08)`,
    }}>
      <div style={{
        maxWidth: "1120px", margin: "0 auto", padding: "0 2rem",
        height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ width: "96px", height: "36px", backgroundColor: "#000", borderRadius: "4px" }} />

        {/* CTA */}
        <a href="#waitlist">
          <button style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
            color: "#fff", border: "none", borderRadius: "1.5rem",
            padding: "0.5rem 1.375rem", fontSize: "0.875rem", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.01em", fontFamily: "var(--font-manrope)",
          }} className="btn-primary">
            Join waitlist
          </button>
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="section-pad-hero" style={{
      position: "relative", minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "9rem 2rem 7rem", textAlign: "center",
      backgroundColor: C.surface, overflow: "hidden",
    }}>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "780px", margin: "0 auto", width: "100%" }}>
        {/* Arab diaspora flags — marquee */}
        <div style={{
          overflow: "hidden", marginBottom: "2.25rem", width: "100%",
          padding: "1rem 0",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}>
          <div className="flag-marquee-track">
            {[
              "🇱🇧","🇸🇾","🇵🇸","🇯🇴","🇪🇬","🇸🇦","🇦🇪","🇮🇶",
              "🇾🇪","🇱🇾","🇹🇳","🇩🇿","🇲🇦","🇸🇩","🇸🇴","🇩🇯",
              "🇰🇼","🇧🇭","🇶🇦","🇴🇲","🇰🇲","🇲🇷",
              /* duplicate for seamless loop */
              "🇱🇧","🇸🇾","🇵🇸","🇯🇴","🇪🇬","🇸🇦","🇦🇪","🇮🇶",
              "🇾🇪","🇱🇾","🇹🇳","🇩🇿","🇲🇦","🇸🇩","🇸🇴","🇩🇯",
              "🇰🇼","🇧🇭","🇶🇦","🇴🇲","🇰🇲","🇲🇷",
            ].map((flag, i) => (
              <span key={i} className="flag-item flag-item--hero">
                {flag}
              </span>
            ))}
          </div>
        </div>

        <h1 className="font-display hero-h1" style={{
          fontSize: "clamp(2rem, 8vw, 4.5rem)", fontWeight: 400,
          lineHeight: 1.1, letterSpacing: "-0.025em", color: C.onSurface,
          marginBottom: "1.75rem",
        }}>
          <span style={{ color: C.primary }}>Speak the Arabic</span>
          <br />
          you've always understood.
        </h1>

        <p style={{
          fontSize: "1.125rem", lineHeight: 1.8, color: C.onSurfaceVariant,
          maxWidth: "540px", margin: "0 auto 3rem",
        }}>
          Ana turns the content you already love into vocabulary that sticks —
          built for heritage speakers ready to go from understanding to fully expressing themselves.
        </p>

        <WaitlistForm />
        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: C.onSurfaceVariant, opacity: 0.6 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Decorative bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
        background: `linear-gradient(to bottom, transparent, ${C.surfaceLow})`,
        pointerEvents: "none",
      }} />
    </section>
  );
}

// ─── Shared feature section layout ───────────────────────────────────────────
function FeatureSection({ title, body, phone, reversed, background, extraContent }: {
  title: string; body: string; phone: React.ReactNode;
  reversed?: boolean; background?: string; extraContent?: React.ReactNode;
}) {
  return (
    <section className="feature-section" style={{ backgroundColor: background || C.surface, padding: "6rem 2rem", overflow: "visible" }}>
      <div className="feature-row" style={{
        maxWidth: "1080px", margin: "0 auto",
        display: "flex", flexDirection: reversed ? "row-reverse" : "row",
        alignItems: "center", gap: "4rem",
      }}>
        {/* Text */}
        <div style={{ flex: "1 1 45%", minWidth: 0 }}>
          <h2 className="font-display" style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700,
            lineHeight: 1.2, color: C.onSurface, marginBottom: "1rem",
          }}>
            {title}
          </h2>
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: C.onSurfaceVariant, maxWidth: "480px" }}>
            {body}
          </p>
        </div>
        {/* Phone */}
        <div style={{ flex: "1 1 55%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", minHeight: "660px" }}>
          {extraContent}
          <div style={{ position: "relative", zIndex: 2 }}>
            <PhoneMockup size="large">{phone}</PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature: Your dialect ───────────────────────────────────────────────────
function FeatureDialect() {
  return (
    <FeatureSection
      title="Arabic isn't one language. Learn the version that's yours."
      body="Choose from Modern Standard Arabic or the dialect your family speaks — Levantine, Egyptian, Gulf, or Darija. Every word you learn is tuned to how your people actually talk."
      phone={<DialectPreview />}
      background={C.surfaceLow}
    />
  );
}

// ─── Feature: Your content ───────────────────────────────────────────────────
function FeatureContent() {
  const [contentSource, setContentSource] = useState<"whatsapp" | "youtube">("whatsapp");

  const platformIcons = (
    <>
      {/* Left: WhatsApp, Chrome, X */}
      {[
        { label: "WhatsApp", src: "whatsapp" as const, bg: "#25D366", top: "80px", left: "40px",
          icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
        { label: "Chrome", bg: "#1a73e8", top: "calc(50% - 26px)", left: "15px",
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" width="26" height="26"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
        { label: "X", bg: "#000000", bottom: "80px", left: "40px",
          icon: <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
      ].map((p) => {
        const isActive = "src" in p && contentSource === p.src;
        const isClickable = "src" in p;
        return (
          <div key={p.label} className="platform-icon" style={{ position: "absolute", top: (p as any).top, bottom: (p as any).bottom, left: p.left, zIndex: 3, cursor: isClickable ? "pointer" : "default" }} onClick={isClickable ? () => setContentSource(p.src!) : undefined} title={p.label}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: p.bg ?? "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isActive ? "0 4px 20px rgba(0,0,0,0.2), 0 0 0 3px #fff, 0 0 0 5.5px #007aff" : "0 4px 20px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.6)", overflow: "hidden", transform: isActive ? "scale(1.12)" : "scale(1)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease" }}>
              {p.icon}
            </div>
          </div>
        );
      })}
      {/* Right: YouTube, TikTok, Instagram */}
      {[
        { label: "YouTube", src: "youtube" as const, bg: "#FF0000", top: "100px", right: "40px",
          icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
        { label: "TikTok", bg: "transparent", top: "calc(50% - 26px)", right: "15px",
          icon: <img src="/tiktok-icon.png" alt="TikTok" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> },
        { label: "Instagram", bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", bottom: "100px", right: "40px",
          icon: <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
      ].map((p) => {
        const isActive = "src" in p && contentSource === (p as any).src;
        const isClickable = "src" in p;
        return (
          <div key={p.label} className="platform-icon" style={{ position: "absolute", top: p.top, bottom: (p as any).bottom, right: p.right, zIndex: 3, cursor: isClickable ? "pointer" : "default" }} onClick={isClickable ? () => setContentSource((p as any).src) : undefined} title={p.label}>
            <div title={p.label} style={{ width: "52px", height: "52px", borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isActive ? "0 4px 20px rgba(0,0,0,0.2), 0 0 0 3px #fff, 0 0 0 5.5px #007aff" : "0 4px 20px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.6)", overflow: "hidden", transform: isActive ? "scale(1.12)" : "scale(1)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease" }}>
              {p.icon}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <FeatureSection
      title="Learn from what you already watch, read, and listen to."
      body="Connect your YouTube, podcasts, and articles. Ana identifies the vocabulary you're missing from the subjects you actually care about — your profession, your interests, your world."
      phone={<ContentPreview externalSource={contentSource} />}
      reversed
      background={C.surface}
      extraContent={platformIcons}
    />
  );
}

// ─── Feature: Study material ─────────────────────────────────────────────────
function FeatureStudy() {
  return (
    <FeatureSection
      title="Flashcards built to actually stick."
      body="It's not just what you memorize — it's how. Every word comes with its root forms, conjugations, context sentence, and word type. Reviewed at the right intervals so you never forget."
      phone={<FlashcardPreview />}
      background={C.surfaceLow}
    />
  );
}

// ─── Feature: Practice ───────────────────────────────────────────────────────
function FeaturePractice() {
  return (
    <FeatureSection
      title="From memorizing to expressing — out loud."
      body="Practice real conversations in your dialect. Speak, get corrected, try again. You'll practice the exact vocabulary you've been studying — until saying it stops feeling like a translation and starts feeling like you."
      phone={<PracticePreview />}
      reversed
      background={C.surface}
    />
  );
}

// ─── Phone mockup wrapper ─────────────────────────────────────────────────────
function PhoneMockup({ children, size = "normal" }: { children: React.ReactNode; size?: "normal" | "large" }) {
  const w = size === "large" ? 340 : 300;
  const scale = w / 300;
  return (
    <div style={{ position: "relative", display: "inline-flex", justifyContent: "center" }}>
      {/* Screen only — no hardware frame */}
      <div style={{
        backgroundColor: C.surface,
        borderRadius: `${40*scale}px`,
        overflow: "hidden",
        position: "relative",
        minHeight: `${580*scale}px`,
        width: `${w}px`,
        display: "flex",
        flexDirection: "column",
        boxShadow: `
          0 ${40*scale}px ${80*scale}px rgba(0,0,0,0.18),
          0 ${12*scale}px ${32*scale}px rgba(0,0,0,0.10),
          0 0 0 1px rgba(0,0,0,0.06)
        `,
      }}>
        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: `${14*scale}px`, left: "50%", transform: "translateX(-50%)",
          width: `${88*scale}px`, height: `${26*scale}px`,
          backgroundColor: "#000", borderRadius: `${16*scale}px`, zIndex: 10,
        }} />
        {/* Status bar */}
        <div style={{
          height: `${52*scale}px`, flexShrink: 0,
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          padding: `0 ${22*scale}px ${8*scale}px`,
        }}>
          <span style={{ fontSize: `${13*scale}px`, fontWeight: 700, fontFamily: "var(--font-inter)", color: C.onSurface, letterSpacing: "-0.4px" }}>9:41</span>
          {/* Signal / WiFi / Battery from Figma iOS kit — colors swapped dark for light bg */}
          <svg viewBox="0 0 66.6613 12" height={`${12*scale}px`} width={`${67*scale}px`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
            <g>
              {/* Battery */}
              <rect opacity="0.35" x="42.8333" y="0.5" width="21" height="10.3333" rx="2.16667" stroke={C.onSurface}/>
              <path opacity="0.4" d="M65.3333 3.66667V7.66667C66.138 7.32789 66.6613 6.5398 66.6613 5.66667C66.6613 4.79353 66.138 4.00544 65.3333 3.66667" fill={C.onSurface}/>
              <rect x="44.3333" y="2" width="18" height="7.33333" rx="1.33333" fill={C.onSurface}/>
              {/* WiFi */}
              <path fillRule="evenodd" clipRule="evenodd" d="M29.6671 3.28448C31.8918 3.28457 34.0314 4.13869 35.6438 5.67028C35.7652 5.78852 35.9593 5.78703 36.0789 5.66693L37.2395 4.4966C37.3 4.43569 37.3338 4.35318 37.3333 4.26733C37.3328 4.18148 37.2981 4.09937 37.2368 4.03917C33.0049 -0.0130575 26.3286 -0.0130575 22.0967 4.03917C22.0354 4.09933 22.0006 4.18141 22 4.26726C21.9994 4.35311 22.0331 4.43565 22.0936 4.4966L23.2546 5.66693C23.3741 5.78721 23.5683 5.7887 23.6897 5.67028C25.3022 4.13858 27.4421 3.28447 29.6671 3.28448ZM29.6671 7.09206C30.8894 7.09199 32.0681 7.54594 32.9742 8.36571C33.0967 8.48206 33.2898 8.47954 33.4092 8.36003L34.5685 7.1897C34.6296 7.12831 34.6634 7.04504 34.6625 6.9585C34.6617 6.87196 34.6261 6.78939 34.5638 6.72926C31.8047 4.16485 27.5318 4.16485 24.7726 6.72926C24.7103 6.78939 24.6748 6.87201 24.6739 6.95857C24.6731 7.04513 24.7071 7.1284 24.7683 7.1897L25.9272 8.36003C26.0467 8.47954 26.2397 8.48206 26.3623 8.36571C27.2677 7.54648 28.4455 7.09257 29.6671 7.09206ZM31.9893 9.6539C31.991 9.74068 31.9569 9.82434 31.8949 9.88514L29.8896 11.9071C29.8308 11.9666 29.7506 12 29.667 12C29.5834 12 29.5033 11.9666 29.4445 11.9071L27.4388 9.88514C27.3769 9.8243 27.3428 9.7406 27.3446 9.65383C27.3465 9.56705 27.384 9.48487 27.4485 9.4267C28.7292 8.34443 30.6048 8.34443 31.8855 9.4267C31.9499 9.48492 31.9875 9.56712 31.9893 9.6539Z" fill={C.onSurface}/>
              {/* Cellular */}
              <path fillRule="evenodd" clipRule="evenodd" d="M16 1H15C14.4477 1 14 1.44772 14 2V10.6667C14 11.219 14.4477 11.6667 15 11.6667H16C16.5523 11.6667 17 11.219 17 10.6667V2C17 1.44772 16.5523 1 16 1ZM10.3333 3.33333H11.3333C11.8856 3.33333 12.3333 3.78105 12.3333 4.33333V10.6667C12.3333 11.219 11.8856 11.6667 11.3333 11.6667H10.3333C9.78106 11.6667 9.33334 11.219 9.33334 10.6667V4.33333C9.33334 3.78105 9.78106 3.33333 10.3333 3.33333ZM6.66666 5.66667H5.66666C5.11437 5.66667 4.66666 6.11438 4.66666 6.66667V10.6667C4.66666 11.219 5.11437 11.6667 5.66666 11.6667H6.66666C7.21894 11.6667 7.66666 11.219 7.66666 10.6667V6.66667C7.66666 6.11438 7.21894 5.66667 6.66666 5.66667ZM2 7.66667H1C0.447715 7.66667 0 8.11438 0 8.66667V10.6667C0 11.219 0.447715 11.6667 1 11.6667H2C2.55228 11.6667 3 11.219 3 10.6667V8.66667C3 8.11438 2.55228 7.66667 2 7.66667Z" fill={C.onSurface}/>
            </g>
          </svg>
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: `0 ${16*scale}px 0`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        {/* Home indicator — always at bottom, from Figma iOS kit */}
        <div style={{ display: "flex", justifyContent: "center", padding: `${6*scale}px 0 ${8*scale}px`, flexShrink: 0 }}>
          <div style={{ width: `${140*scale}px`, height: `${5*scale}px`, borderRadius: "100px", backgroundColor: "#0a0a0a" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Feature preview mocks ────────────────────────────────────────────────────

function ContentPreview({ externalSource }: { externalSource?: "whatsapp" | "youtube" }) {
  // phase 0-5 = WhatsApp (6 steps), phase 6-9 = YouTube (4 steps)
  const [phase, setPhase] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [msgCount, setMsgCount] = useState(0); // drip-feed messages in step 0
  const source = phase < 6 ? "whatsapp" : "youtube";
  const step = phase < 6 ? phase : phase - 6;
  const totalSteps = source === "whatsapp" ? 6 : 4;

  const switchSource = (src: "whatsapp" | "youtube") => {
    setPhase(src === "whatsapp" ? 0 : 6);
    setMsgCount(0);
    setTimerKey(k => k + 1);
  };

  // Respond to external source changes (from orbiting icons)
  useEffect(() => {
    if (externalSource) switchSource(externalSource);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSource]);

  // Drip-feed messages during step 0 (4 items: teta1, reply, teta2, hint)
  useEffect(() => {
    if (source === "whatsapp" && step === 0) {
      setMsgCount(0);
      const t = setInterval(() => {
        setMsgCount(c => {
          if (c >= 4) { clearInterval(t); return 4; }
          return c + 1;
        });
      }, 800);
      return () => clearInterval(t);
    }
  }, [source, step]);

  // Phase timer — step 0 gets extra time for drip-feed
  useEffect(() => {
    const delay = (source === "whatsapp" && step === 0) ? 5500 : 2800;
    const t = setTimeout(() => setPhase(p => {
      if (p < 6) return (p + 1) % 6;        // WhatsApp: 0→5→0
      return 6 + ((p - 6 + 1) % 4);          // YouTube: 6→9→6
    }), delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerKey]);

  const stepLabels: Record<string, string[]> = {
    whatsapp: ["You got this message", "Forward it to Ana", "Ana received it", "Ana breaks it down", "Pick your words", "Added to your deck"],
    youtube:  ["You're watching this video", "Add it to Ana", "Ana listens for new words", "Ready to study"],
  };

  const waWords = [
    { arabic: "نفتقدك",  english: "we miss you" },
    { arabic: "حبيبتي",  english: "my darling" },
    { arabic: "بشوق",    english: "with longing" },
  ];
  const ytWords = [
    { arabic: "مستثمر",  english: "investor" },
    { arabic: "تمويل",   english: "funding" },
    { arabic: "مشروع",   english: "project" },
  ];
  const words = source === "whatsapp" ? waWords : ytWords;

  // WhatsApp chat header — exact Figma node 8:4709 (name kept as Teta / 👵)
  const WAHeader = () => (
    <div style={{ position: "relative", paddingTop: "4px", paddingBottom: "4px", paddingRight: "22px", flexShrink: 0 }}>
      {/* Frosted glass bg layer */}
      <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "rgba(245,242,235,0.85)" }} />
      {/* Contacts row */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: chevron + unread + contact */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* Chevron — 32×32 overflow:hidden, L-shape rotated -135deg = back arrow */}
          <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden", flexShrink: 0, marginRight: "-1px" }}>
            <div style={{ position: "absolute", left: "10.5px", top: "8px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ transform: "rotate(-135deg)", flexShrink: 0 }}>
                <div style={{ position: "relative", width: "11.314px", height: "11.314px" }}>
                  <div style={{ position: "absolute", top: "-11.49%", right: "-11.49%", bottom: "-11.49%", left: "-11.49%" }}>
                    <svg viewBox="0 0 13.9137 13.9137" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.3 1.3H12.6137V12.6137" stroke="#007aff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Unread count */}
          <div style={{ width: "31px", flexShrink: 0, marginRight: "-1px", overflow: "hidden" }}>
            <p style={{ fontSize: "16.8px", fontWeight: 500, letterSpacing: "-0.336px", color: "#007aff", lineHeight: "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>1</p>
          </div>
          {/* Contact: avatar + name */}
          <div style={{ display: "flex", flex: 1, gap: "10px", alignItems: "center", minWidth: 0, marginRight: "-1px" }}>
            <div style={{ position: "relative", width: "36px", height: "36px", borderRadius: "18px", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, border: "0.212px solid rgba(10,10,10,0.1)", borderRadius: "28px", overflow: "hidden", backgroundColor: "#e0d5c8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem" }}>👵</div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", paddingBottom: "0.5px" }}>
              <p style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.32px", color: "#0a0a0a", lineHeight: "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Teta</p>
              <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.12px", color: "rgba(0,0,0,0.5)", lineHeight: "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>tap here for contact info</p>
            </div>
          </div>
        </div>
        {/* Right: video + phone icons */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", paddingBottom: "2px", flexShrink: 0 }}>
          {/* Video — 32×32, icon 25.6×16.6 at (3.2, 7.7) */}
          <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "3.2px", top: "7.7px", width: "25.6px", height: "16.6px" }}>
              <svg viewBox="0 0 25.5997 16.5996" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.7998 1.59961C16.7387 1.59961 17.5 2.36092 17.5 3.2998V13.2998C17.5 14.2387 16.7387 15 15.7998 15H3.2998C2.36092 15 1.59961 14.2387 1.59961 13.2998V3.2998C1.59961 2.36092 2.36092 1.59961 3.2998 1.59961H15.7998ZM15.7998 16.5996C17.6223 16.5996 19.0996 15.1223 19.0996 13.2998V11.3262L22.6182 14.3892C23.7829 15.4029 25.5995 14.5759 25.5997 13.0318V3.56792C25.5995 2.02376 23.783 1.19672 22.6182 2.2105L19.0996 5.27348V3.2998C19.0996 1.47727 17.6223 0 15.7998 0H3.2998C1.47727 0 1.61075e-07 1.47727 0 3.2998V13.2998C4.02651e-08 15.1223 1.47727 16.5996 3.2998 16.5996H15.7998ZM19.0996 7.39522V9.20448L23.669 13.1822C23.7984 13.2946 23.9999 13.2031 24.0001 13.0318V3.56792C23.9999 3.39652 23.7984 3.3051 23.669 3.41753L19.0996 7.39522Z" fill="#0a0a0a"/>
              </svg>
            </div>
          </div>
          {/* Phone — 32×32, icon 20.057×20.057 at (5.86, 6.1) */}
          <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: "5.86px", top: "6.1px", width: "20.057px", height: "20.057px" }}>
              <svg viewBox="0 0 20.0566 20.0569" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.9092 20.0569C11.9868 20.0569 8.4082 18.2317 5.1167 14.9402C1.80469 11.6282 0 8.05983 0 5.12721C0 3.35328 0.481934 2.17408 1.65088 1.12819C1.73291 1.05641 1.81494 0.984631 1.90723 0.9026C2.59424 0.287366 3.271 -0.00999761 3.91699 0.0002563C4.65527 0.0105102 5.34229 0.43092 5.97803 1.34352L8.04932 4.3274C8.68506 5.24 8.75684 6.32692 7.89551 7.18824L7.11621 7.9778C6.88037 8.21364 6.87012 8.40846 7.00342 8.6443C7.41357 9.2903 8.18262 10.1721 8.98242 10.9617C9.74121 11.7205 10.8589 12.6946 11.4126 13.0432C11.6382 13.1868 11.8433 13.1765 12.0791 12.9407L12.8687 12.1511C13.73 11.3001 14.8066 11.3718 15.7295 12.0076L18.7134 14.0789C19.626 14.7146 20.0566 15.4016 20.0566 16.1399C20.0566 16.7859 19.7695 17.4627 19.1543 18.1497C19.0825 18.2317 19.0005 18.324 18.9185 18.406C17.8828 19.575 16.7036 20.0569 14.9092 20.0569ZM14.9194 18.4778C16.0576 18.4573 17.0317 18.0676 17.729 17.2678C17.7905 17.1961 17.8315 17.1448 17.8931 17.073C18.1597 16.7654 18.3032 16.4373 18.3032 16.1399C18.3032 15.8323 18.1904 15.5759 17.8828 15.3709L14.8989 13.3816C14.5708 13.1765 14.2222 13.156 13.9043 13.4739L13.002 14.3762C12.2944 15.0838 11.4331 15.0325 10.7461 14.5198C9.94629 13.9251 8.70557 12.8176 7.92627 12.0281C7.13672 11.2488 6.12158 10.1004 5.53711 9.3108C5.02441 8.62379 4.97314 7.76246 5.68066 7.05494L6.58301 6.1526C6.90088 5.83473 6.88037 5.47584 6.66504 5.15797L4.67578 2.17408C4.48096 1.86647 4.21436 1.75367 3.91699 1.75367C3.61963 1.75367 3.2915 1.89723 2.98389 2.16383C2.91211 2.2151 2.86084 2.26637 2.78906 2.32789C1.98926 3.02516 1.58936 3.99928 1.56885 5.12721C1.51758 7.74196 3.61963 11.2078 6.2959 13.8738C8.95166 16.5193 12.3047 18.5291 14.9194 18.4778Z" fill="#0a0a0a"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // iOS-style share sheet — fixed to bottom of phone screen, no overflow
  const IOSShareSheet = ({ edgeToEdge = false }: { edgeToEdge?: boolean }) => {
    // Contacts row (People section from iOS share sheet)
    const contacts = [
      { name: "Teta",  emoji: "👵", badge: { bg: "#25d366", symbol: "💬" } },
      { name: "Sara",  initial: "S",  color: "#5e5ce6", badge: { bg: "#007aff", symbol: "✉" } },
      { name: "Baba",  initial: "ب", color: "#30b0c7", badge: { bg: "#25d366", symbol: "💬" } },
      { name: "Layla", initial: "L",  color: "#ff6369", badge: { bg: "#007aff", symbol: "✉" } },
    ];

    // App icons row — real logos from Figma (Messages, Mail, WhatsApp, Messenger), Ana custom
    const apps: { name: string; img?: string; svgIcon?: React.ReactNode; highlight?: boolean }[] = [
      { name: "Messenger", img: "/icons/messenger.svg" },
      { name: "Messages", img: "/icons/messages.svg" },
      { name: "Mail",     img: "/icons/mail.svg" },
      { name: "WhatsApp", img: "/icons/whatsapp.svg" },
      {
        name: "Ana",
        svgIcon: (
          <svg viewBox="0 0 60 60" width="42" height="42" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" rx="13" fill="#000000"/>
          </svg>
        ),
        highlight: true,
      },
    ];

    const divider = (
      <div style={{ height: "0.5px", backgroundColor: "rgba(60,60,67,0.13)", margin: "0 0.875rem" }} />
    );

    return (
      <div style={{
        backgroundColor: "#f2f2f7",
        borderRadius: "0.875rem 0.875rem 0 0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.16)",
        margin: edgeToEdge ? 0 : "0 -16px -16px",
        overflow: "hidden",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0.35rem 0 0.15rem" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#c7c7cc" }} />
        </div>

        {/* ── Contacts (People) row ── */}
        <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: "0.25rem", padding: "0.5rem 0.875rem 0.625rem", minWidth: "max-content" }}>
            {contacts.map(c => (
              <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", width: "52px" }}>
                {/* Avatar */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    backgroundColor: c.emoji ? "#e5e5ea" : c.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: c.emoji ? "1.25rem" : "0.75rem",
                    color: "#fff", fontWeight: 600,
                  }}>
                    {c.emoji ?? c.initial}
                  </div>
                  {/* App badge */}
                  <div style={{
                    position: "absolute", bottom: "-1px", right: "-2px",
                    width: "16px", height: "16px", borderRadius: "50%",
                    backgroundColor: c.badge.bg,
                    border: "1.5px solid #f2f2f7",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.45rem",
                  }}>
                    <span style={{ color: "#fff", fontSize: "0.45rem" }}>{c.badge.symbol}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.5rem", color: "#000", textAlign: "center", lineHeight: 1.2, maxWidth: "52px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
              </div>
            ))}
          </div>
        </div>

        {divider}

        {/* ── Apps row ── */}
        <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.625rem 0.875rem", minWidth: "max-content" }}>
            {apps.map(app => (
              <div key={app.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", width: "48px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "9px",
                  position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: app.highlight
                    ? "0 0 0 2.5px #007aff, 0 0 0 5px rgba(0,122,255,0.22), 0 3px 12px rgba(0,122,255,0.35)"
                    : "0 1px 4px rgba(0,0,0,0.1)",
                  transform: app.highlight ? "scale(1.08)" : "scale(1)",
                }}>
                  {app.img
                    ? <img src={app.img} alt={app.name} style={{ width: "42px", height: "42px", display: "block" }} />
                    : app.svgIcon
                  }
                  {app.highlight && (
                    <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#007aff", border: "2px solid #f2f2f7", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                      <svg viewBox="0 0 10 10" width="8" height="8"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: "0.48rem", color: app.highlight ? "#007aff" : "#000", fontWeight: app.highlight ? 600 : 400, textAlign: "center", lineHeight: 1 }}>{app.name}</p>
              </div>
            ))}
          </div>
        </div>

        {divider}

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", padding: "0.5rem 0.625rem 0.625rem" }}>
          {[
            { label: "Copy", icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><rect x="8" y="8" width="12" height="13" rx="2" stroke="#3c3c43" strokeWidth="1.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" stroke="#3c3c43" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { label: "Save to Files", icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#3c3c43" strokeWidth="1.5"/></svg> },
          ].map((btn, i, arr) => (
            <div key={btn.label} style={{
              backgroundColor: "#fff",
              borderRadius: "0.75rem",
              boxShadow: "0 0 8px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.5rem 0.75rem",
            }}>
              <p style={{ fontSize: "0.6875rem", color: "#000" }}>{btn.label}</p>
              {btn.icon}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Shared: processing screen
  const Processing = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "0.875rem", padding: "1rem 0" }}>
      <div style={{ width: "46px", height: "46px", borderRadius: "1rem", backgroundColor: "#000000" }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: C.onSurface, marginBottom: "0.25rem" }}>
          {source === "whatsapp" ? "Reading the message…" : "Listening to the video…"}
        </p>
        <p style={{ fontSize: "0.625rem", color: C.onSurfaceVariant }}>Finding words you haven't learned yet</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", justifyContent: "center" }}>
        {words.map((w, i) => (
          <div key={w.arabic} style={{ backgroundColor: C.surfaceLow, borderRadius: "1rem", padding: "0.25rem 0.625rem", animation: `wordPop 0.35s ease ${i * 0.25}s both` }}>
            <span className="arabic" style={{ fontSize: "0.9375rem", color: C.primary, fontWeight: 600 }}>{w.arabic}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Shared: result screen
  const Result = () => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ backgroundColor: "#f0fdf4", borderRadius: "0.875rem", padding: "0.625rem 0.875rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1rem" }}>✅</span>
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
            {source === "whatsapp" ? "3 words from this message" : "3 words from this video"}
          </p>
          <p style={{ fontSize: "0.575rem", color: "#6ee7b7" }}>Added to your deck</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.875rem" }}>
        {words.map(w => (
          <div key={w.arabic} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surfaceLow, borderRadius: "0.75rem", padding: "0.5rem 0.75rem" }}>
            <span style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant }}>{w.english}</span>
            <span className="arabic" style={{ fontSize: "1rem", color: C.primary, fontWeight: 600 }}>{w.arabic}</span>
          </div>
        ))}
      </div>
      <button style={{ width: "100%", border: "none", borderRadius: "0.875rem", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`, color: "#fff", fontSize: "0.8125rem", fontWeight: 700, padding: "0.75rem", fontFamily: "var(--font-manrope)", cursor: "pointer" }}>
        Study now →
      </button>
    </div>
  );

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%", fontFamily: "var(--font-inter)", cursor: "pointer" }}
      onClick={() => setPhase(p => (p + 1) % 9)}>

      {/* Step label */}
      <p style={{ fontSize: "0.575rem", fontWeight: 700, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        {stepLabels[source][step]}
      </p>

      {/* Animated step content */}
      <div key={phase} style={{ flex: 1, display: "flex", flexDirection: "column", animation: "stepFadeIn 0.35s ease" }}>

        {/* ── WhatsApp steps ── */}
        {source === "whatsapp" && step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, margin: "0 -16px", backgroundColor: "#f5f2eb", backgroundImage: "url('/wa-wallpaper.jpg')", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "0 0 1.5rem 1.5rem", overflow: "hidden" }}>
            <WAHeader />

            {/* Date badge */}
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
              <div style={{ backgroundColor: "white", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "8px", minWidth: "100px", padding: "3px 14px", display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "#0a0a0a", fontWeight: 400, textAlign: "center" }}>Today</span>
              </div>
            </div>

            {/* Messages — drip-fed via msgCount */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "0 8px", overflowY: "hidden", justifyContent: "flex-end" }}>
              {/* Received: Teta */}
              {msgCount >= 1 && (
              <div style={{ display: "flex", alignSelf: "flex-start", maxWidth: "82%", animation: "stepFadeIn 0.3s ease" }}>
                <div style={{ backgroundColor: "#fff", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "12px 12px 12px 0", padding: "5.5px 10px 6.5px" }}>
                  <p className="arabic" style={{ fontSize: "15.8px", color: "#0a0a0a", lineHeight: "21px", letterSpacing: "-0.2054px", textAlign: "right", direction: "rtl" }}>حبيبتي كيف حالك؟ 💕</p>
                  <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", textAlign: "right", letterSpacing: "0.55px", marginTop: "2px" }}>10:21</p>
                </div>
              </div>
              )}
              {/* Sent: You */}
              {msgCount >= 2 && (
              <div style={{ display: "flex", alignSelf: "flex-end", maxWidth: "82%", animation: "stepFadeIn 0.3s ease" }}>
                <div style={{ backgroundColor: "#d0fecf", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "12px 12px 0 12px", padding: "5.5px 10px 6.5px" }}>
                  <p className="arabic" style={{ fontSize: "15.8px", color: "#0a0a0a", lineHeight: "21px", letterSpacing: "-0.2054px", direction: "rtl", textAlign: "right" }}>الحمد لله إن شاء الله ❤️</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                    <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", letterSpacing: "0.55px" }}>10:22</p>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 4L3.5 6.5L8.5 1.5" stroke="#34b7f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 4L8 6.5L13 1.5" stroke="#34b7f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
              )}
              {/* Received: Teta again — with forward button */}
              {msgCount >= 3 && (
              <div style={{ display: "flex", alignSelf: "flex-start", maxWidth: "86%", position: "relative", animation: "stepFadeIn 0.3s ease" }}>
                <div style={{ backgroundColor: "#fff", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "12px 12px 12px 0", padding: "5.5px 10px 6.5px" }}>
                  <p className="arabic" style={{ fontSize: "15.8px", color: "#0a0a0a", lineHeight: "21px", letterSpacing: "-0.2054px", textAlign: "right", direction: "rtl" }}>وحشتنا كثير يا عيني 🥺</p>
                  <p className="arabic" style={{ fontSize: "15.8px", color: "#0a0a0a", lineHeight: "21px", letterSpacing: "-0.2054px", textAlign: "right", direction: "rtl", marginTop: "2px" }}>نفتقدك كثيراً وبشوقنالك 💕</p>
                  <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", textAlign: "right", letterSpacing: "0.55px", marginTop: "2px" }}>10:24</p>
                </div>
                {/* Forward button */}
                <div style={{ position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)", width: "32px", height: "32px", borderRadius: "16px", backgroundColor: "#b2b2b2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <svg viewBox="0 0 14.9165 13.2477" width="15" height="13.8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.85931 13.2477C8.21325 13.2477 8.50219 13.1032 8.84891 12.7781L14.5482 7.39673C14.8226 7.13669 14.9165 6.8622 14.9165 6.62383C14.9165 6.37824 14.8299 6.11097 14.5482 5.84371L8.84891 0.51286C8.46607 0.151691 8.2277 0 7.87375 0C7.36812 0 7.00695 0.397286 7.00695 0.881252V3.61169H6.79747C4.16663 3.61169 0.602537 6.12361 0.0036242 12.0282C-0.0579749 12.6355 0.680447 12.9197 1.09315 12.4699C3.24134 10.1289 4.32889 9.6432 6.79747 9.6432H7.00695V12.4025C7.00695 12.8865 7.36812 13.2477 7.85931 13.2477Z" fill="#F4F4F4"/>
                  </svg>
                </div>
              </div>
              )}
              {/* Hint card */}
              {msgCount >= 4 && (
              <div style={{ backgroundColor: C.tertiaryFixed, borderRadius: "0.75rem", padding: "6px 10px", display: "flex", alignItems: "center", gap: "6px", margin: "2px 0", animation: "stepFadeIn 0.3s ease" }}>
                <span style={{ fontSize: "0.875rem" }}>🤔</span>
                <p style={{ fontSize: "0.5625rem", color: C.tertiary, fontWeight: 600, lineHeight: 1.4 }}>You felt it. But some words slipped by.</p>
              </div>
              )}
            </div>

            {/* WhatsApp input bar — exact Figma node 8:4710 */}
            <div style={{ position: "relative", width: "100%" }}>
              {/* Frosted glass background — absolute layer exactly as in Figma */}
              <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "rgba(245,242,235,0.85)" }} />
              {/* Input row — pl:7 pr:9 py:5.5 gap:8 */}
              <div style={{ position: "relative", display: "flex", gap: "8px", alignItems: "center", paddingLeft: "7px", paddingRight: "9px", paddingTop: "5.5px", paddingBottom: "5.5px" }}>

                {/* Plus — 32×32 overflow:hidden, icon 19.6×19.6 at (6.1, 6.1) */}
                <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "6.1px", left: "6.1px", width: "19.6px", height: "19.6px" }}>
                    <svg viewBox="0 0 19.8008 19.8008" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M9 10.8008V18.9004C9 19.3974 9.40333 19.8008 9.90039 19.8008C10.3974 19.8008 10.8008 19.3974 10.8008 18.9004V10.8008H18.9004C19.3974 10.8008 19.8008 10.3974 19.8008 9.90039C19.8008 9.40333 19.3974 9 18.9004 9H10.8008V0.900391C10.8008 0.403334 10.3974 0 9.90039 0C9.40333 0 9 0.403334 9 0.900391V9H0.900391C0.403334 9 0 9.40333 0 9.90039C0 10.3974 0.403334 10.8008 0.900391 10.8008H9Z" fill="#0a0a0a"/>
                    </svg>
                  </div>
                </div>

                {/* Input field — white bg, 0.33px border, radius:15, pt:3 pb:2 pl:10 pr:9 gap:16 items-end */}
                <div style={{ flex: 1, backgroundColor: "#fff", border: "0.33px solid #b2b2b2", borderRadius: "15px", display: "flex", alignItems: "flex-end", gap: "16px", paddingTop: "3px", paddingBottom: "2px", paddingLeft: "10px", paddingRight: "9px", overflow: "hidden", minHeight: "34px" }}>
                  {/* Text area — empty, no placeholder */}
                  <div style={{ flex: 1, minHeight: 0, paddingBottom: "3px" }}>
                    <span style={{ display: "block", fontSize: "16px", lineHeight: "21px" }}>&nbsp;</span>
                  </div>
                  {/* Sticker — 24×24 overflow:hidden, icon 18.2×17.7 at (2.9, 2.9) */}
                  <div style={{ position: "relative", width: "24px", height: "24px", overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "2.9px", left: "2.9px", width: "18.2px", height: "17.7px" }}>
                      <svg viewBox="0 0 18.2 17.7" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.71545 3.72537e-06L11.0358 8.19571e-06C11.5593 1.14001e-06 11.8592 -2.89828e-06 12.1178 0.0203541C15.3543 0.275071 17.9249 2.84569 18.1797 6.08218C18.2 6.34084 18.2 6.64072 18.2 7.16419V7.2376C18.2 8.03798 18.2 8.47707 18.1704 8.85322C17.7999 13.5608 14.0608 17.2999 9.35322 17.6704C8.97707 17.7 8.53798 17.7 7.73759 17.7H7.35239C6.65428 17.7 6.25434 17.7 5.91012 17.6639C2.81095 17.3381 0.3619 14.8891 0.036164 11.7899C-1.21743e-05 11.4457 -4.8726e-06 11.0458 7.89024e-06 10.3478L3.72537e-06 8.71546C-9.66265e-05 6.74938 -0.000154197 5.62153 0.284202 4.68413C0.924072 2.57476 2.57476 0.924072 4.68413 0.284202C5.62153 -0.000154197 6.74938 -9.66265e-05 8.71545 3.72537e-06ZM8.85001 1.20001C6.71283 1.20001 5.77749 1.20653 5.03247 1.43253C3.30662 1.95606 1.95606 3.30662 1.43253 5.03247C1.20653 5.77749 1.20001 6.71283 1.20001 8.85001V10.3C1.20001 11.0583 1.20084 11.3909 1.22959 11.6645C1.4961 14.2001 3.49987 16.2039 6.03555 16.4704C6.30911 16.4992 6.64175 16.5 7.40001 16.5H7.70001C8.54719 16.5 8.93598 16.4995 9.25907 16.4741C9.39493 16.4634 9.49982 16.3476 9.49941 16.2066C9.49931 16.1731 9.49921 16.1395 9.4991 16.106C9.49677 15.3486 9.4944 14.5839 9.55649 13.8239C9.61402 13.1198 9.73311 12.5381 10.0014 12.0116C10.4424 11.1461 11.1461 10.4424 12.0116 10.0014C12.5381 9.73311 13.1198 9.61402 13.8239 9.55649C14.6478 9.48918 15.476 9.49285 16.2977 9.49744C16.5427 9.4988 16.6331 9.49703 16.7099 9.46105C16.7767 9.42981 16.8451 9.36818 16.8831 9.30504C16.927 9.23206 16.9372 9.15071 16.9592 8.92684C16.9647 8.87108 16.9697 8.81515 16.9741 8.75907C16.9995 8.43598 17 8.04719 17 7.20001C17 6.63139 16.9995 6.38191 16.9834 6.17633C16.775 3.5283 14.6717 1.42506 12.0237 1.21665C11.8181 1.20048 11.5686 1.20001 11 1.20001H8.85001ZM16.0751 10.6978C15.3535 10.6945 14.6348 10.6942 13.9217 10.7525C13.2918 10.804 12.8856 10.9029 12.5564 11.0706C11.9167 11.3965 11.3965 11.9167 11.0706 12.5564C10.9029 12.8856 10.804 13.2918 10.7525 13.9217C10.7128 14.4079 10.7031 14.9967 10.7007 15.7526C10.7004 15.8574 10.7003 15.9288 10.7054 15.9835C10.7104 16.0369 10.7195 16.0632 10.7308 16.0811C10.7562 16.1215 10.8033 16.156 10.8494 16.1681C10.8706 16.1736 10.8977 16.1744 10.9468 16.164C10.9977 16.1532 11.0619 16.1329 11.1567 16.1026C13.5656 15.3341 15.4983 13.513 16.4177 11.1765C16.4562 11.0786 16.4823 11.012 16.4972 10.959C16.5116 10.9077 16.5123 10.8795 16.5077 10.8576C16.4975 10.8093 16.4639 10.7597 16.4228 10.7323C16.4049 10.7204 16.3775 10.7104 16.3206 10.7046C16.2626 10.6987 16.1864 10.6983 16.0751 10.6978Z" fill="#0a0a0a"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Camera + Mic — gap:7 pl:6 items-start */}
                <div style={{ display: "flex", gap: "7px", paddingLeft: "6px", alignItems: "flex-start", flexShrink: 0 }}>
                  {/* Camera — 32×32 overflow:hidden, icon 23.6×18.1 at (4.2, 6.2) */}
                  <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "6.2px", left: "4.2px", width: "23.6px", height: "18.1px" }}>
                      <svg viewBox="0 0 23.5996 18.0996" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22 5.0498C22 4.24899 21.3506 3.59961 20.5498 3.59961H16.834C16.1006 3.59961 15.4037 3.2776 14.9287 2.71875L14.2471 1.91699C14.0761 1.71592 13.8255 1.59961 13.5615 1.59961H10.0352C9.77123 1.59961 9.52056 1.71592 9.34961 1.91699L8.66797 2.71875C8.19302 3.2776 7.49611 3.59961 6.7627 3.59961H3.0498C2.24899 3.59961 1.59961 4.24899 1.59961 5.0498V15.0498C1.59961 15.8506 2.24899 16.5 3.0498 16.5H20.5498C21.3506 16.5 22 15.8506 22 15.0498V5.0498ZM23.5996 15.0498C23.5996 16.7343 22.2343 18.0996 20.5498 18.0996H3.0498C1.36534 18.0996 0 16.7343 0 15.0498V5.0498C0 3.36534 1.36534 2 3.0498 2H6.7627C7.02666 2 7.27729 1.88374 7.44824 1.68262L8.12988 0.880859C8.60483 0.322009 9.30174 0 10.0352 0H13.5615C14.2949 0 14.9918 0.32201 15.4668 0.880859L16.1484 1.68262C16.3194 1.88374 16.57 2 16.834 2H20.5498C22.2343 2 23.5996 3.36534 23.5996 5.0498V15.0498ZM15.2481 10.0488C15.2479 8.14395 13.7028 6.59961 11.7979 6.59961C9.89314 6.5998 8.34887 8.14407 8.34868 10.0488C8.34868 11.9537 9.89303 13.4988 11.7979 13.499C13.7029 13.499 15.2481 11.9539 15.2481 10.0488ZM16.8477 10.0488C16.8477 12.8375 14.5866 15.0986 11.7979 15.0986C9.00937 15.0984 6.74907 12.8374 6.74907 10.0488C6.74926 7.26041 9.00948 5.00019 11.7979 5C14.5865 5 16.8475 7.2603 16.8477 10.0488ZM18.4499 7.5998C19.1402 7.5998 19.6999 7.04016 19.6999 6.3498C19.6999 5.65945 19.1402 5.0998 18.4499 5.0998C17.7595 5.0998 17.1999 5.65945 17.1999 6.3498C17.1999 7.04016 17.7595 7.5998 18.4499 7.5998Z" fill="#0a0a0a"/>
                      </svg>
                    </div>
                  </div>
                  {/* Mic — 32×32 overflow:hidden, icon 15.6×22.8 at (8.2, 4.0) */}
                  <div style={{ position: "relative", width: "32px", height: "32px", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "4px", left: "8.2px", width: "15.6px", height: "22.8px" }}>
                      <svg viewBox="0 0 15.5996 22.7998" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.5 4.2998C10.5 2.80864 9.29097 1.59961 7.7998 1.59961C6.30864 1.59961 5.09961 2.80864 5.09961 4.2998V11.7998C5.09961 13.291 6.30864 14.5 7.7998 14.5C9.29097 14.5 10.5 13.291 10.5 11.7998V4.2998ZM12.0996 11.7998C12.0996 14.1746 10.1746 16.0996 7.7998 16.0996C5.42498 16.0996 3.5 14.1746 3.5 11.7998V4.2998C3.5 1.92498 5.42498 0 7.7998 0C10.1746 0 12.0996 1.92498 12.0996 4.2998V11.7998ZM0 11.7998C3.86208e-08 11.358 0.357977 11 0.799805 11C1.24163 11 1.59961 11.358 1.59961 11.7998C1.59961 12.614 1.75971 13.4206 2.07129 14.1729C2.38287 14.925 2.84034 15.6079 3.41602 16.1836C3.99169 16.7593 4.67461 17.2167 5.42676 17.5283C6.17898 17.8399 6.98561 18 7.7998 18C8.614 18 9.42063 17.8399 10.1729 17.5283C10.925 17.2167 11.6079 16.7593 12.1836 16.1836C12.7593 15.6079 13.2167 14.925 13.5283 14.1729C13.8399 13.4206 14 12.614 14 11.7998C14 11.358 14.358 11 14.7998 11C15.2416 11 15.5996 11.358 15.5996 11.7998C15.5996 12.8241 15.3978 13.8388 15.0059 14.7852C14.6139 15.7313 14.0396 16.5912 13.3154 17.3154C12.5912 18.0396 11.7313 18.6139 10.7852 19.0059C10.0862 19.2954 9.34999 19.4811 8.60015 19.5584V21.9998C8.60015 22.4416 8.24197 22.7998 7.80015 22.7998C7.35832 22.7998 7.00015 22.4416 7.00015 21.9998V19.5585C6.25006 19.4812 5.5136 19.2955 4.81445 19.0059C3.86828 18.6139 3.00837 18.0396 2.28418 17.3154C1.55999 16.5912 0.985733 15.7313 0.59375 14.7852C0.201763 13.8388 -8.03702e-08 12.8241 0 11.7998Z" fill="#0a0a0a"/>
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {source === "whatsapp" && step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, margin: "0 -16px", backgroundColor: "#fff", borderRadius: "0 0 1.5rem 1.5rem", overflow: "hidden" }}>
            {/* Header — "Done" bottom-aligned in tall header, then "1 Selected" */}
            <div style={{ display: "flex", alignItems: "flex-end", padding: "0 12px 6px", minHeight: "44px", flexShrink: 0 }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.24px" }}>Done</p>
            </div>
            <div style={{ padding: "0 12px 2px", flexShrink: 0 }}>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.8px" }}>1 Selected</p>
            </div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "4px", padding: "6px 12px 4px", flexShrink: 0 }}>
              {["All", "Unread", "Favourites", "Groups"].map((f, i) => (
                <div key={f} style={{ backgroundColor: "#f4f4f4", borderRadius: "14px", padding: "3px 10px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, color: i === 0 ? "#767779" : "#bdbdbd", letterSpacing: "-0.1px", lineHeight: "15px" }}>{f}</p>
                </div>
              ))}
            </div>
            {/* Chat list */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "hidden" }}>
              {[
                { name: "Teta 👵", preview: "حبيبتي كيف حالك؟ 💕", time: "10:24", selected: false, arabic: true },
                { name: "Ana Bot", preview: "Send me Arabic messages to learn!", time: "09:15", selected: true },
                { name: "Baba", preview: "Did you eat?", time: "08:30", selected: false },
                { name: "Sara", preview: "omg yes!! 😂", time: "Yesterday", selected: false },
                { name: "Mama 💕", preview: "Call me when you can habibi", time: "Yesterday", selected: false },
              ].map(chat => (
                <div key={chat.name} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 10px", position: "relative" }}>
                  {/* Selection bg — spans between separators, edge to edge */}
                  {chat.selected && <div style={{ position: "absolute", top: "-0.16px", bottom: "-0.16px", left: "-16px", right: "-16px", backgroundColor: "#f4f4f4", zIndex: 0 }} />}
                  {/* Checkbox */}
                  <div style={{ width: "16px", height: "16px", borderRadius: "8px", flexShrink: 0, position: "relative", zIndex: 1, ...(chat.selected
                    ? { backgroundColor: "#1dab61", display: "flex", alignItems: "center", justifyContent: "center" }
                    : { border: "1.5px solid #b2b2b2" }
                  ) }}>
                    {chat.selected && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5L3.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  {/* Avatar */}
                  <div style={{ width: "36px", height: "36px", borderRadius: "18px", flexShrink: 0, backgroundColor: chat.name === "Ana Bot" ? "#000" : "#e0d5c8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", border: "0.33px solid rgba(10,10,10,0.1)", overflow: "hidden", position: "relative", zIndex: 1 }}>
                    {chat.name === "Teta 👵" && "👵"}
                    {chat.name === "Baba" && "👨"}
                    {chat.name === "Sara" && <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>S</span>}
                    {chat.name === "Mama 💕" && "👩"}
                  </div>
                  {/* Name + preview — separator is on this div, selection bg aligns to it */}
                  <div style={{ flex: 1, minWidth: 0, borderBottom: "0.33px solid rgba(0,0,0,0.2)", padding: "8px 0 6px", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.24px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</p>
                      <p style={{ fontSize: "10px", color: chat.selected ? "#1dab61" : "#767779", letterSpacing: "-0.1px", flexShrink: 0, marginLeft: "4px" }}>{chat.time}</p>
                    </div>
                    <p style={{ fontSize: "10px", color: "#767779", letterSpacing: "-0.1px", lineHeight: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{chat.preview}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Bottom toolbar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)", backgroundColor: "rgba(244,244,244,0.8)", borderTop: "0.33px solid rgba(0,0,0,0.3)" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "8px 20px 4px" }}>
                <p style={{ fontSize: "12px", color: "#0a0a0a" }}>Forward</p>
                <p style={{ fontSize: "12px", color: "#767779" }}>Read</p>
                <p style={{ fontSize: "12px", color: "#767779" }}>Delete</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ana Bot WhatsApp chat — message received + reply */}
        {source === "whatsapp" && step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, margin: "0 -16px", backgroundColor: "#f5f2eb", backgroundImage: "url('/wa-wallpaper.jpg')", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "0 0 1.5rem 1.5rem", overflow: "hidden" }}>
            {/* Ana Bot header */}
            <div style={{ position: "relative", paddingTop: "4px", paddingBottom: "4px", paddingRight: "22px", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "rgba(245,242,235,0.85)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px", padding: "0 10px" }}>
                <svg viewBox="0 0 13.9137 13.9137" width="10" height="10" fill="none"><path d="M1.3 1.3H12.6137V12.6137" stroke="#007aff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-135, 6.95, 6.95)"/></svg>
                <div style={{ width: "32px", height: "32px", borderRadius: "16px", backgroundColor: "#000", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.28px" }}>Ana Bot</p>
                  <p style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>online</p>
                </div>
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "8px 8px", justifyContent: "flex-end", overflowY: "hidden" }}>
              {/* Forwarded message from Teta — received by Ana */}
              <div style={{ display: "flex", alignSelf: "flex-end", maxWidth: "86%" }}>
                <div style={{ backgroundColor: "#d0fecf", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "12px 12px 0 12px", padding: "5.5px 10px 6.5px" }}>
                  <p style={{ fontSize: "9px", color: "rgba(0,0,0,0.4)", fontStyle: "italic", marginBottom: "2px" }}>Forwarded</p>
                  <p className="arabic" style={{ fontSize: "13px", color: "#0a0a0a", lineHeight: "18px", letterSpacing: "-0.17px", textAlign: "right", direction: "rtl" }}>وحشتنا كثير يا عيني 🥺</p>
                  <p className="arabic" style={{ fontSize: "13px", color: "#0a0a0a", lineHeight: "18px", letterSpacing: "-0.17px", textAlign: "right", direction: "rtl" }}>نفتقدك كثيراً وبشوقنالك 💕</p>
                  <p style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", textAlign: "right", letterSpacing: "0.55px", marginTop: "2px" }}>10:25</p>
                </div>
              </div>
              {/* Ana Bot reply */}
              <div style={{ display: "flex", alignSelf: "flex-start", maxWidth: "88%", animation: "stepFadeIn 0.4s ease 0.6s both" }}>
                <div style={{ backgroundColor: "#fff", border: "0.66px solid rgba(0,0,0,0.06)", borderRadius: "12px 12px 12px 0", padding: "5.5px 10px 6.5px" }}>
                  <p style={{ fontSize: "12px", color: "#0a0a0a", lineHeight: "17px", letterSpacing: "-0.15px" }}>Got it! I found <strong>3 new words</strong> for you to learn.</p>
                  <p style={{ fontSize: "12px", color: "#0a0a0a", lineHeight: "17px", letterSpacing: "-0.15px", marginTop: "4px" }}>Open Ana to review them 👇</p>
                  <div style={{ marginTop: "6px", backgroundColor: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "6px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "6px", backgroundColor: "#000", flexShrink: 0 }} />
                    <p style={{ fontSize: "11px", color: "#007aff", fontWeight: 600 }}>Open in Ana →</p>
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(0,0,0,0.5)", textAlign: "right", letterSpacing: "0.55px", marginTop: "2px" }}>10:25</p>
                </div>
              </div>
            </div>
            {/* Input bar */}
            <div style={{ position: "relative", width: "100%", flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "rgba(245,242,235,0.85)" }} />
              <div style={{ position: "relative", display: "flex", gap: "8px", alignItems: "center", padding: "5.5px 9px 5.5px 7px" }}>
                <div style={{ flex: 1, backgroundColor: "#fff", border: "0.33px solid #b2b2b2", borderRadius: "15px", padding: "5px 10px", minHeight: "30px" }}>
                  <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.35)" }}>&nbsp;</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Ana word-by-word breakdown */}
        {source === "whatsapp" && step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "0.375rem", backgroundColor: "#000000", flexShrink: 0 }} />
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.onSurface }}>Message from Teta</p>
            </div>
            <div style={{ backgroundColor: C.surfaceLow, borderRadius: "0.875rem", padding: "0.625rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {[
                { arabic: "حبيبتي",    english: "my darling",   known: true },
                { arabic: "كيف حالك؟", english: "how are you?", known: true },
                { arabic: "نفتقدك",    english: "we miss you",  known: false },
                { arabic: "كثيراً",    english: "very much",    known: false },
                { arabic: "بشوق",      english: "with longing", known: false },
              ].map((w, i) => (
                <div key={w.arabic} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.3rem 0.5rem", borderRadius: "0.5rem",
                  backgroundColor: w.known ? "transparent" : `${C.primary}10`,
                  animation: `wordPop 0.3s ease ${i * 0.1}s both`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    {!w.known && <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: C.primary, flexShrink: 0 }} />}
                    <span style={{ fontSize: "0.625rem", color: w.known ? C.onSurfaceVariant : C.onSurface }}>{w.english}</span>
                  </div>
                  <span className="arabic" style={{ fontSize: "0.9375rem", color: w.known ? C.onSurfaceVariant : C.primary, fontWeight: w.known ? 400 : 600 }}>{w.arabic}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.55rem", color: C.onSurfaceVariant, textAlign: "center" }}>3 words you haven't seen before</p>
          </div>
        )}

        {/* Step 4: Word selection */}
        {source === "whatsapp" && step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.onSurface, marginBottom: "0.125rem" }}>Add to your deck</p>
            {[
              { arabic: "نفتقدك", english: "we miss you",  selected: true },
              { arabic: "كثيراً", english: "very much",    selected: true },
              { arabic: "بشوق",   english: "with longing", selected: true },
            ].map((w, i) => (
              <div key={w.arabic} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                backgroundColor: `${C.primary}10`, borderRadius: "0.875rem",
                padding: "0.5rem 0.75rem",
                border: `1.5px solid ${C.primary}30`,
                animation: `wordPop 0.3s ease ${i * 0.15}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "18px", height: "18px", borderRadius: "0.375rem", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: C.onSurface }}>{w.english}</span>
                </div>
                <span className="arabic" style={{ fontSize: "1rem", color: C.primary, fontWeight: 600 }}>{w.arabic}</span>
              </div>
            ))}
            <button style={{ width: "100%", border: "none", borderRadius: "0.875rem", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`, color: "#fff", fontSize: "0.8125rem", fontWeight: 700, padding: "0.625rem", fontFamily: "var(--font-manrope)", cursor: "pointer", marginTop: "0.125rem" }}>
              Add 3 words →
            </button>
          </div>
        )}

        {source === "whatsapp" && step === 5 && <Result />}

        {/* ── YouTube steps ── */}
        {source === "youtube" && step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* Video card */}
            <div style={{ borderRadius: "0.875rem", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(160deg, #004a30 0%, #006442 60%, #1a7a50 100%)", height: "108px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.875rem", marginLeft: "2px" }}>▶</span>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", padding: "0.5rem 0.75rem" }}>
                  <p className="arabic" style={{ fontSize: "0.8125rem", color: "#fff", lineHeight: 1.3, fontWeight: 600 }}>كيف تبني شركة ناجحة من الصفر</p>
                </div>
              </div>
              <div style={{ backgroundColor: C.surfaceLow, padding: "0.4rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.575rem", color: C.onSurfaceVariant }}>بزنس بالعربي · 245K views</p>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: C.tertiary, backgroundColor: C.tertiaryFixed, borderRadius: "1rem", padding: "0.15rem 0.5rem" }}>Business</span>
              </div>
            </div>
            {/* Hint */}
            <div style={{ backgroundColor: C.tertiaryFixed, borderRadius: "0.75rem", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ fontSize: "0.75rem" }}>💡</span>
              <p style={{ fontSize: "0.575rem", color: C.tertiary, fontWeight: 500 }}>Business terms you haven't learned yet</p>
            </div>
          </div>
        )}

        {source === "youtube" && step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Video card — fully visible at top */}
            <div style={{ borderRadius: "0.875rem", overflow: "hidden", marginBottom: "0.75rem" }}>
              <div style={{ background: "linear-gradient(160deg, #004a30 0%, #006442 60%, #1a7a50 100%)", height: "108px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.875rem", marginLeft: "2px" }}>▶</span>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.65))", padding: "0.5rem 0.75rem" }}>
                  <p className="arabic" style={{ fontSize: "0.8125rem", color: "#fff", lineHeight: 1.3, fontWeight: 600 }}>كيف تبني شركة ناجحة من الصفر</p>
                </div>
              </div>
              <div style={{ backgroundColor: C.surfaceLow, padding: "0.4rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "0.575rem", color: C.onSurfaceVariant }}>بزنس بالعربي · 245K views</p>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: C.tertiary, backgroundColor: C.tertiaryFixed, borderRadius: "1rem", padding: "0.15rem 0.5rem" }}>Business</span>
              </div>
            </div>
            {/* Share sheet fills remaining space below */}
            <div style={{ flex: 1 }} />
            <IOSShareSheet />
          </div>
        )}

        {source === "youtube" && step === 2 && <Processing />}
        {source === "youtube" && step === 3 && <Result />}
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem", paddingTop: "0.5rem", paddingBottom: "0.25rem" }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{
            height: "5px", borderRadius: "3px", transition: "all 0.3s ease",
            width: i === step ? "16px" : "5px",
            backgroundColor: i === step ? C.primary : C.outlineVariant,
          }} />
        ))}
      </div>
    </div>
  );
}

function DialectPreview() {
  const [selected, setSelected] = useState("levantine");
  const dialects = [
    { id: "msa",       label: "Modern Standard", arabic: "الفصحى",   flags: "🌍",             region: "Universal Arabic" },
    { id: "levantine", label: "Levantine",        arabic: "الشامية",  flags: "🇸🇾 🇱🇧 🇵🇸 🇯🇴", region: "Syria · Lebanon · Palestine · Jordan" },
    { id: "egyptian",  label: "Egyptian",         arabic: "المصرية",  flags: "🇪🇬",             region: "Egypt" },
    { id: "gulf",      label: "Gulf",             arabic: "الخليجية", flags: "🇸🇦 🇦🇪 🇰🇼 🇶🇦", region: "Saudi Arabia · UAE · Kuwait · Qatar" },
    { id: "darija",    label: "Darija",           arabic: "الدارجة",  flags: "🇲🇦 🇩🇿 🇹🇳",    region: "Morocco · Algeria · Tunisia" },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.375rem" }}>Your dialect</p>
      <p className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: C.onSurface, marginBottom: "1rem", lineHeight: 1.3 }}>Which Arabic feels like home?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {dialects.map((d) => (
          <div
            key={d.id}
            onClick={() => setSelected(d.id)}
            style={{
              borderRadius: "1rem", padding: "0.75rem 1rem", cursor: "pointer",
              backgroundColor: selected === d.id ? C.primary : C.surfaceLow,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: selected === d.id ? "#fff" : C.onSurface }}>{d.label}</p>
                <span style={{ fontSize: "0.875rem" }}>{d.flags}</span>
              </div>
              <p style={{ fontSize: "0.6875rem", color: selected === d.id ? "rgba(255,255,255,0.6)" : C.onSurfaceVariant }}>{d.region}</p>
            </div>
            <span className="arabic" style={{ fontSize: "1.1rem", color: selected === d.id ? "rgba(255,255,255,0.9)" : C.primary }}>{d.arabic}</span>
          </div>
        ))}
      </div>
      <button style={{
        marginTop: "1.25rem", width: "100%",
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
        color: "#fff", border: "none", borderRadius: "0.875rem",
        padding: "0.875rem", fontSize: "0.9375rem", fontWeight: 700,
        fontFamily: "var(--font-manrope)", cursor: "pointer",
      }}>
        Continue →
      </button>
    </div>
  );
}

function FlashcardPreview() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Study</p>
        <span style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant }}>12 / 24 cards</span>
      </div>
      {/* Progress bar */}
      <div style={{ height: "4px", backgroundColor: C.surfaceHigh, borderRadius: "2px", marginBottom: "1.25rem" }}>
        <div style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, ${C.primary}, ${C.primaryContainer})`, borderRadius: "2px" }} />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "100%", borderRadius: "1.25rem", cursor: "pointer",
          backgroundColor: flipped ? C.primary : C.surfaceLow,
          padding: "1.75rem", transition: "background-color 0.3s",
          marginBottom: "1rem",
        }}
      >
        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <p className="arabic" style={{ fontSize: "2.75rem", color: C.primary, marginBottom: "0.5rem" }}>قاوَمَ</p>
            <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, fontWeight: 500 }}>Tap to reveal</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p className="arabic" style={{ fontSize: "1.75rem", color: "#fff", marginBottom: "0.25rem" }}>قاوَمَ</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>to resist</p>
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "1rem", padding: "0.2rem 0.6rem" }}>Verb</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { label: "Past", arabic: "قاوَمَ" },
                { label: "Present", arabic: "يُقاوِمُ" },
                { label: "Command", arabic: "قاوِمْ" },
                { label: "Verbal noun", arabic: "مُقاوَمة" },
              ].map((form) => (
                <div key={form.label} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 0.75rem" }}>
                  <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>{form.label}</p>
                  <p className="arabic" style={{ fontSize: "1rem", color: "#fff" }}>{form.arabic}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem", fontStyle: "italic" }}>
              "ما قدرش يقاوم" — from Paranormal, Episode 2
            </p>
          </div>
        )}
      </div>
      <p style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant, opacity: 0.6, textAlign: "center", marginBottom: "1rem" }}>
        {flipped ? "How well did you know it?" : "Tap the card to reveal"}
      </p>
      {flipped && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Again", color: "#dc2626", bg: "#fef2f2" },
            { label: "Hard", color: "#d97706", bg: "#fffbeb" },
            { label: "Good", color: C.primary, bg: C.surfaceLow },
            { label: "Easy", color: "#059669", bg: "#f0fdf4" },
          ].map((btn) => (
            <button key={btn.label} onClick={() => setFlipped(false)} style={{
              flex: 1, border: "none", borderRadius: "0.75rem",
              padding: "0.625rem 0", fontSize: "0.75rem", fontWeight: 700,
              backgroundColor: btn.bg, color: btn.color, cursor: "pointer",
              fontFamily: "var(--font-manrope)",
            }}>{btn.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PracticePreview() {
  const messages = [
    { from: "prompt", text: "كيف كان يومك في العمل؟", translation: "How was your day at work?" },
    { from: "user", text: "كان يوماً صعباً، لكن...", translation: "It was a hard day, but..." },
    { from: "tutor", text: 'جيد! بدلاً من "صعباً" جرّب "مرهقاً" — أكثر تعبيراً 👌', translation: null },
    { from: "user", text: "شكراً، سأحاول مرة أخرى", translation: "Thanks, I'll try again" },
    { from: "tutor", text: "ممتاز! نطقك يتحسن كثيراً 🎯", translation: null },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Practice</p>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, backgroundColor: C.surfaceLow,
          color: C.primary, borderRadius: "1rem", padding: "0.2rem 0.6rem",
        }}>Levantine 🇱🇧</span>
      </div>

      {/* Scenario chip */}
      <div style={{
        backgroundColor: C.surfaceLow, borderRadius: "0.875rem",
        padding: "0.625rem 0.875rem", marginBottom: "1rem",
      }}>
        <p style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant, lineHeight: 1.4 }}>
          📍 Scenario: <span style={{ fontWeight: 600, color: C.onSurface }}>Talking to a colleague about your workday</span>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", borderRadius: "1rem", padding: "0.625rem 0.875rem",
              backgroundColor: m.from === "user" ? C.primary : m.from === "tutor" ? C.tertiaryFixed : C.surfaceLow,
            }}>
              <p className="arabic" style={{ fontSize: "0.875rem", color: m.from === "user" ? "#fff" : m.from === "tutor" ? C.tertiary : C.onSurface, lineHeight: 1.5 }}>{m.text}</p>
              {m.translation && <p style={{ fontSize: "0.6rem", color: m.from === "user" ? "rgba(255,255,255,0.6)" : C.onSurfaceVariant, marginTop: "0.2rem" }}>{m.translation}</p>}
            </div>
          </div>
        ))}
      </div>
      {/* Mic button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 0 8px ${C.primary}22`,
        }}>
          <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21h-2v2h6v-2h-2v-2.07A8 8 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────
function Problem() {
  const [activeCard, setActiveCard] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCard(i); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const cards = [
    {
      number: "01", label: "The feeling",
      headline: "You understand every word.",
      text: "Your parents speak to you in Arabic. You get it all. You answer in English — and something is lost.",
      bg: C.surfaceLow, dark: false,
    },
    {
      number: "02", label: "The plateau",
      headline: "Apps didn't cut it.",
      text: "You tried Duolingo. Textbook phrases that never come up in real life. You plateaued, got bored, gave up.",
      bg: C.surfaceHighest, dark: false,
    },
    {
      number: "03", label: "The gap",
      headline: "What you need isn't in any curriculum.",
      text: "It's in your family's stories, the shows they watch, the culture they carry.",
      bg: "#0d2118", dark: true,
    },
  ];

  return (
    <section style={{ position: "relative", backgroundColor: C.surface }}>

      <div className="problem-layout" style={{ display: "flex", flexDirection: "row", maxWidth: "1080px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Left: sticky, full viewport height ── */}
        <div className="problem-sticky-left" style={{
          position: "sticky", top: 0, height: "100vh", flexShrink: 0,
          width: "42%", display: "flex", alignItems: "center",
          padding: "0 3rem 0 2rem",
        }}>
          <div>
            <h2 className="font-display" style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700,
              lineHeight: 1.2, color: C.onSurface, marginBottom: "1.25rem",
            }}>
              You understand more than you think.
            </h2>
            <p className="font-display" style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 400,
              color: C.onSurfaceVariant,
            }}>
              Saying it is the hard part.
            </p>
          </div>
        </div>

        {/* ── Right: scrollable cards, each 55vh ── */}
        <div className="problem-right-col" style={{ flex: 1, padding: "10vh 2rem 20vh 0" }}>
          {cards.map((card, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              className="problem-card-wrapper" style={{ height: "55vh", display: "flex", alignItems: "center" }}
            >
              <div style={{
                width: "100%",
                opacity: activeCard === i ? 1 : 0.4,
                transform: activeCard === i ? "scale(1)" : "scale(0.95)",
                transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
                backgroundColor: card.bg,
                borderRadius: "1.5rem",
                padding: "2.5rem",
                minHeight: "300px",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: activeCard === i
                  ? "0 12px 48px rgba(0,0,0,0.12)"
                  : "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                {/* Step number */}
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                  border: `1.5px solid ${card.dark ? "rgba(255,255,255,0.2)" : C.outlineVariant}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8125rem", fontWeight: 600,
                  color: card.dark ? "rgba(255,255,255,0.45)" : C.onSurfaceVariant,
                  fontFamily: "var(--font-inter)",
                }}>
                  {card.number}
                </div>
                {/* Content */}
                <div>
                  <p style={{
                    fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: "0.875rem",
                    color: card.dark ? "rgba(255,255,255,0.35)" : C.tertiary,
                  }}>
                    {card.label}
                  </p>
                  <p className="font-display" style={{
                    fontSize: "clamp(1.25rem, 2vw, 1.625rem)", fontWeight: 700,
                    lineHeight: 1.25, marginBottom: "0.75rem",
                    color: card.dark ? "#fff" : C.onSurface,
                  }}>
                    {card.headline}
                  </p>
                  <p style={{
                    fontSize: "1.0625rem", lineHeight: 1.8,
                    color: card.dark ? "rgba(255,255,255,0.65)" : C.onSurfaceVariant,
                  }}>
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who it's for ─────────────────────────────────────────────────────────────
function WhoItsFor() {
  return (
    <section className="section-pad" style={{ position: "relative", backgroundColor: C.surfaceLow, padding: "7rem 2rem", overflow: "hidden" }}>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto" }}>
        <h2 className="font-display" style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2,
          color: C.onSurface, marginBottom: "0.75rem",
        }}>
          Built for the in-between.
        </h2>
        <p className="font-display" style={{
          fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 400,
          color: C.onSurfaceVariant, marginBottom: "3.5rem",
        }}>
          Heritage speakers who almost have it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {[
            {
              arabic: "أفهم كل شيء",
              translation: "I understand everything",
              body: "You grew up hearing Arabic at home. You get every word your parents say. But when you try to speak, something freezes.",
            },
            {
              arabic: "أريد أن أتواصل",
              translation: "I want to connect",
              body: "Your grandparents, your cousins back home — the conversations that matter most are in Arabic.",
            },
            {
              arabic: "لغتي، تراثي",
              translation: "My language, my heritage",
              body: "This isn't just about vocabulary. It's about owning a part of yourself that never quite felt fully yours.",
            },
          ].map((p) => (
            <div key={p.arabic} style={{
              backgroundColor: C.surface, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: "0px 20px 40px rgba(28,28,25,0.05)",
            }}>
              <p className="arabic" style={{ fontSize: "1.5rem", color: C.primary, marginBottom: "0.25rem" }}>{p.arabic}</p>
              <p style={{ fontSize: "0.75rem", color: C.tertiary, fontWeight: 500, marginBottom: "1.25rem", fontStyle: "italic" }}>{p.translation}</p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: C.onSurfaceVariant }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Waitlist CTA ─────────────────────────────────────────────────────────────
function WaitlistCTA() {
  return (
    <section id="waitlist" className="section-pad" style={{
      position: "relative", padding: "9rem 2rem", backgroundColor: C.surface,
      textAlign: "center", overflow: "hidden",
    }}>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto" }}>
        <p className="arabic" style={{ fontSize: "2rem", color: C.primary, marginBottom: "1.5rem", opacity: 0.75 }}>
          ابدأ رحلتك
        </p>
        <h2 className="font-display" style={{
          fontSize: "clamp(1.875rem, 4.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1,
          color: C.onSurface, marginBottom: "1.25rem", letterSpacing: "-0.02em",
        }}>
          Be first to express yourself.
        </h2>
        <p style={{
          fontSize: "1.0625rem", lineHeight: 1.8, color: C.onSurfaceVariant, marginBottom: "2.75rem",
        }}>
          Ana is in early development. Join the waitlist and we'll reach out when we're ready to welcome our first users.
        </p>
        <WaitlistForm />
        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: C.onSurfaceVariant, opacity: 0.55 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      heading: "Product",
      links: ["Features", "How it works", "Dialects", "Study system", "Speaking practice", "Pricing"],
    },
    {
      heading: "Company",
      links: ["About", "Our story", "Blog", "Careers", "Press"],
    },
    {
      heading: "Community",
      links: ["For heritage speakers", "For parents", "For educators", "Ambassador program"],
    },
    {
      heading: "Support",
      links: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
    },
  ];

  const textMuted = "rgba(235,232,227,0.45)";
  const textSub   = "rgba(235,232,227,0.7)";
  const textMain  = "rgba(235,232,227,0.92)";

  return (
    <footer style={{
      position: "relative", overflow: "hidden",
      // Deep heritage green gradient — dark forest floor rising to midnight canopy
      background: `linear-gradient(175deg, #0a1f14 0%, #0d2318 40%, #071510 100%)`,
    }}>
      {/* Subtle geometric pattern overlay */}
      <DiamondPatternBg opacity={0.06} color="#ffffff" />
      {/* Warm glow from bottom-center — the "oasis" light source */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px", pointerEvents: "none",
        background: `radial-gradient(ellipse at center bottom, rgba(0,100,66,0.18) 0%, transparent 70%)`,
      }} />
      {/* Tertiary gold accent line at top */}
      <div style={{
        height: "2px",
        background: `linear-gradient(90deg, transparent 0%, ${C.tertiary} 30%, ${C.tertiaryFixed} 50%, ${C.tertiary} 70%, transparent 100%)`,
        opacity: 0.5,
      }} />

      {/* Main footer body */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1120px", margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "3rem" }} className="footer-grid">

          {/* Brand column */}
          <div>
            <div style={{ width: "96px", height: "36px", backgroundColor: "#000", borderRadius: "4px", marginBottom: "1rem" }} />
            <p style={{ fontSize: "0.9375rem", color: textSub, lineHeight: 1.75, marginBottom: "2rem", maxWidth: "220px" }}>
              Learn to express yourself in the Arabic your family speaks.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.875rem" }}>
              {[
                { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "IG", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                { label: "TK", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.14a4.85 4.85 0 0 1-1-.45z" },
              ].map((s) => (
                <a key={s.label} href="#" style={{
                  width: "36px", height: "36px", borderRadius: "0.625rem",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={textSub}>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="font-display" style={{
                fontSize: "0.8125rem", fontWeight: 700, color: textMain,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {col.links.map((link) => (
                  <a key={link} href="#" style={{
                    fontSize: "0.9375rem", color: textMuted, textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = textMain)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom" style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "1120px", margin: "0 auto",
        padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <p style={{ fontSize: "0.8125rem", color: textMuted }}>
          © {new Date().getFullYear()} Ana. Built for the diaspora.
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy policy", "Terms of service", "Cookie settings"].map((link) => (
            <a key={link} href="#" style={{ fontSize: "0.8125rem", color: textMuted, textDecoration: "none" }}>{link}</a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ─── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        backgroundColor: C.surfaceLow, borderRadius: "1.25rem",
        padding: "1.5rem 2rem", display: "inline-block",
      }}>
        <p className="font-display" style={{ fontWeight: 700, color: C.primary, fontSize: "1.125rem" }}>
          You're on the list.
        </p>
        <p style={{ fontSize: "0.875rem", color: C.onSurfaceVariant, marginTop: "0.25rem" }}>
          We'll be in touch when Ana is ready for you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex", gap: "0.75rem", flexWrap: "wrap",
      justifyContent: "center", maxWidth: "480px", margin: "0 auto",
    }}>
      <input
        type="email" required placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
        className="waitlist-input"
        style={{
          flex: "1 1 220px", backgroundColor: C.surfaceLow, border: "none",
          borderRadius: "0.75rem", padding: "0.875rem 1.25rem", fontSize: "1rem",
          color: C.onSurface, fontFamily: "var(--font-inter)",
        }}
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary" style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
        color: "#fff", border: "none", borderRadius: "0.75rem",
        padding: "0.875rem 1.75rem", fontSize: "1rem", fontWeight: 600,
        fontFamily: "var(--font-manrope)", cursor: status === "loading" ? "wait" : "pointer",
        whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1,
      }}>
        {status === "loading" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p style={{ width: "100%", textAlign: "center", fontSize: "0.875rem", color: "#b91c1c" }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
