"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlass,
  PencilSimple,
  CheckCircle,
  Users,
  Lightning,
  CreditCard,
  Calendar,
} from "@phosphor-icons/react";
import { validateSession, getToken } from "@/lib/session";

const PRIMARY = "#6D0D35";
const BLUSH = "#f4ede5";
const TEXT = "#1e0f14";
const TEXT_MID = "#5c3d47";
const TEXT_MUTED = "#9e8085";

export default function HomePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const revealsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    let cancelled = false;
    validateSession().then((result) => {
      if (cancelled) return;
      if (result.valid) {
        router.replace("/dashboard");
        return;
      }
      setToken(getToken());
    }).finally(() => {
      if (!cancelled) setChecking(false);
    });
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            revealsRef.current.add(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#fdfaf7", color: TEXT }}>
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] h-[68px] flex items-center justify-between px-5 md:px-12 lg:px-20 transition-shadow ${
          navScrolled ? "shadow-[0_4px_30px_rgba(109,13,53,0.07)]" : ""
        }`}
        style={{
          background: "rgba(253,250,247,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(109,13,53,0.06)",
        }}
      >
        <Link href="/" className="flex items-center">
          <Image src="/logo/logo1.png" alt="Gatherlii" width={140} height={36} className="h-9 w-auto object-contain" priority />
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <Link href="#how" className="px-5 py-2.5 rounded-full text-[13px] font-normal border border-primary/20 hover:border-primary hover:text-primary transition-colors" style={{ color: TEXT_MID }}>
            How it works
          </Link>
          {!checking && (
            token ? (
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full text-[13px] font-medium text-white" style={{ background: PRIMARY, boxShadow: "0 4px 18px rgba(109,13,53,0.28)" }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 rounded-full text-[13px] font-normal border border-primary/20 hover:border-primary hover:text-primary transition-colors" style={{ color: TEXT_MID }}>
                  Log In
                </Link>
                <Link href="/register" className="px-5 py-2.5 rounded-full text-[13px] font-medium text-white" style={{ background: PRIMARY, boxShadow: "0 4px 18px rgba(109,13,53,0.28)" }}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span className="w-[22px] h-[1.5px] rounded-sm bg-primary" />
          <span className="w-[22px] h-[1.5px] rounded-sm bg-primary" />
          <span className="w-[22px] h-[1.5px] rounded-sm bg-primary" />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-[68px] left-0 right-0 z-[99] flex flex-col gap-3 p-5 md:hidden"
          style={{
            background: "rgba(253,250,247,0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(109,13,53,0.06)",
          }}
        >
          <Link href="#how" className="w-full text-center py-3 rounded-full text-[13px] font-normal border border-primary/20" style={{ color: TEXT_MID }} onClick={() => setMobileMenuOpen(false)}>
            How it works
          </Link>
          {!checking && (
            token ? (
              <Link href="/dashboard" className="w-full text-center py-3 rounded-full text-[13px] font-medium text-white" style={{ background: PRIMARY }} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="w-full text-center py-3 rounded-full text-[13px] font-normal border border-primary/20" style={{ color: TEXT_MID }} onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/register" className="w-full text-center py-3 rounded-full text-[13px] font-medium text-white" style={{ background: PRIMARY }} onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      )}

      <main>
        {/* Hero */}
        <section
          className="min-h-screen grid lg:grid-cols-2 items-center pt-[68px] px-5 md:px-12 lg:px-20 gap-10 lg:gap-16 relative overflow-hidden"
        >
          <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(109,13,53,0.05) 0%, transparent 65%)" }} />
          <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(184,147,90,0.07) 0%, transparent 65%)" }} />

          <div className="relative py-12 lg:py-24 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
              style={{ background: "rgba(109,13,53,0.07)", border: "1px solid rgba(109,13,53,0.12)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[2px] text-primary">Premium Event Planning</span>
            </div>

            <h1 className="font-serif text-[clamp(40px,5vw,72px)] font-normal leading-[1.05] tracking-[-1.5px] mb-5" style={{ color: TEXT }}>
              Elegance
              <br />
              in Every
              <br />
              Detail. <span className="font-cursive italic font-normal text-primary tracking-[-1px]">Planning</span>
              <br />
              Made Perfect.
            </h1>

            <p className="text-[clamp(14px,1.5vw,17px)] font-light leading-relaxed max-w-[420px] mb-10 mx-auto lg:mx-0" style={{ color: TEXT_MID }}>
              Experience a premium approach to event planning and coordination. Discover curated vendors, create memorable events, and manage everything in one place.
            </p>

            <div className="flex flex-wrap gap-3 mb-14 justify-center lg:justify-start">
              {!checking && (
                token ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-px"
                    style={{ background: PRIMARY, boxShadow: "0 4px 18px rgba(109,13,53,0.28)" }}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-px"
                      style={{ background: PRIMARY, boxShadow: "0 4px 18px rgba(109,13,53,0.28)" }}
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-normal border border-primary/20 hover:border-primary hover:text-primary transition-colors"
                      style={{ color: TEXT_MID }}
                    >
                      Log In
                    </Link>
                  </>
                )
              )}
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2.5">
                {["F", "A", "M", "+"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-[#fdfaf7]"
                    style={{ background: "linear-gradient(135deg, #e5dbd0, #ede4da)", color: PRIMARY }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-[12.5px] font-light" style={{ color: TEXT_MUTED }}>
                <span className="font-medium" style={{ color: TEXT_MID }}>2,400+</span> events planned this month
              </p>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative flex items-center justify-center py-12 lg:py-20">
            <div className="relative w-full max-w-[340px] lg:max-w-[480px]">
              <div
                className="w-full aspect-[4/5] rounded-[28px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #f4ede5 0%, #ede4da 100%)",
                  border: "1px solid rgba(109,13,53,0.06)",
                  boxShadow: "0 32px 80px rgba(109,13,53,0.12), 0 8px 32px rgba(0,0,0,0.05)",
                }}
              >
                <span className="font-cursive text-[120px] font-bold" style={{ color: "rgba(109,13,53,0.12)", letterSpacing: "-4px" }}>
                  G
                </span>
              </div>
              <div
                className="absolute top-[10%] left-[-6%] lg:left-[-14%] bg-white rounded-2xl p-3 px-4 shadow-lg animate-[float_4s_ease-in-out_infinite] hidden sm:block"
                style={{ border: "1px solid rgba(109,13,53,0.06)", boxShadow: "0 12px 40px rgba(109,13,53,0.1)" }}
              >
                <div className="text-[9.5px] uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>Next event</div>
                <div className="text-[22px] font-semibold font-cursive text-primary">Mar 14</div>
                <div className="text-[11px] font-light flex items-center gap-1" style={{ color: TEXT_MUTED }}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Al-Rashid Wedding
                </div>
              </div>
              <div
                className="absolute bottom-[14%] right-[-6%] lg:right-[-12%] bg-white rounded-2xl p-3 px-4 shadow-lg animate-[float_4s_ease-in-out_infinite] hidden sm:block"
                style={{ border: "1px solid rgba(109,13,53,0.06)", boxShadow: "0 12px 40px rgba(109,13,53,0.1)", animationDelay: "-2s" }}
              >
                <div className="text-[9.5px] uppercase tracking-wider mb-1" style={{ color: TEXT_MUTED }}>Vendors confirmed</div>
                <div className="text-[22px] font-semibold font-cursive text-primary">12 / 12</div>
                <div className="text-[11px] font-medium text-emerald-600">✓ All set</div>
              </div>
            </div>
          </div>
        </section>

        {/* Gold line */}
        <div className="w-full h-px opacity-20" style={{ background: "linear-gradient(90deg, transparent 0%, #b8935a 30%, #6D0D35 60%, transparent 100%)" }} />

        {/* How it Works */}
        <section id="how" className="py-16 md:py-24 lg:py-32 px-5 md:px-12 lg:px-20" style={{ background: BLUSH }}>
          <p className="text-[10px] font-medium uppercase tracking-[3px] text-primary text-center mb-3" data-reveal>The Process</p>
          <h2 className="text-[clamp(34px,5vw,58px)] font-semibold text-center tracking-[-1px] leading-tight mb-3" style={{ color: TEXT }} data-reveal>
            How <span className="italic font-light text-primary">It Works</span>
          </h2>
          <p className="text-[clamp(14px,1.5vw,16px)] font-light text-center max-w-[520px] mx-auto mb-16 leading-relaxed" style={{ color: TEXT_MUTED }} data-reveal>
            A streamlined, elegant process for planning your perfect event — from vision to celebration.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { num: "01", icon: MagnifyingGlass, title: "Discover", body: "Browse curated venues and vendors tailored to your vision and budget. Every partner is vetted for quality." },
              { num: "02", icon: PencilSimple, title: "Plan", body: "Create your event, manage guests, and coordinate every detail in one beautifully designed workspace." },
              { num: "03", icon: CheckCircle, title: "Enjoy", body: "Book catering, track orders, and experience a seamless event from the first detail to the final toast." },
            ].map((step, i) => {
              const StepIcon = step.icon;
              return (
              <div
                key={step.title}
                className="bg-white rounded-[24px] p-9 border border-primary/5 hover:border-primary/10 hover:shadow-xl hover:-translate-y-1.5 transition-all"
                data-reveal
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-[64px] font-light leading-none mb-5" style={{ color: "rgba(109,13,53,0.12)", letterSpacing: "-2px" }}>{step.num}</div>
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5" style={{ background: "rgba(109,13,53,0.07)", border: "1px solid rgba(109,13,53,0.12)", color: PRIMARY }}>
                  <StepIcon size={20} weight="regular" />
                </div>
                <h3 className="text-[26px] font-semibold mb-2.5 tracking-[-0.3px]" style={{ color: TEXT }}>{step.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: TEXT_MUTED }}>{step.body}</p>
              </div>
            );
            })}
          </div>

          {/* Features strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-20 rounded-[24px] overflow-hidden border border-primary/5" style={{ background: "rgba(109,13,53,0.06)" }}>
            {[
              { icon: Users, title: "Guest Management", body: "Invitations, RSVPs, and seating in one place." },
              { icon: Lightning, title: "Curated Catering", body: "Premium vendors for every cuisine and style." },
              { icon: CreditCard, title: "Seamless Payments", body: "Pay vendors directly with secure checkout." },
              { icon: Calendar, title: "Event Timeline", body: "Visual scheduling so nothing is ever missed." },
            ].map((f) => {
              const FIcon = f.icon;
              return (
              <div key={f.title} className="bg-white p-9 text-center hover:bg-[#f4ede5] transition-colors">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(109,13,53,0.07)", color: PRIMARY }}>
                  <FIcon size={18} weight="regular" />
                </div>
                <h4 className="text-xl font-semibold mb-1.5" style={{ color: TEXT }}>{f.title}</h4>
                <p className="text-[13px] font-light leading-relaxed" style={{ color: TEXT_MUTED }}>{f.body}</p>
              </div>
            );
            })}
          </div>
        </section>

        {/* Gold line */}
        <div className="w-full h-px opacity-20" style={{ background: "linear-gradient(90deg, transparent 0%, #b8935a 30%, #6D0D35 60%, transparent 100%)" }} />

        {/* Testimonials */}
        <section className="py-16 md:py-24 lg:py-32 px-5 md:px-12 lg:px-20 bg-white">
          <p className="text-[10px] font-medium uppercase tracking-[3px] text-primary text-center mb-3" data-reveal>Stories</p>
          <h2 className="text-[clamp(34px,5vw,58px)] font-semibold text-center tracking-[-1px] leading-tight mb-3" style={{ color: TEXT }} data-reveal>
            Loved by <span className="italic font-light text-primary">Event Planners</span>
          </h2>
          <p className="text-[clamp(14px,1.5vw,16px)] font-light text-center max-w-[520px] mx-auto mb-16 leading-relaxed" style={{ color: TEXT_MUTED }} data-reveal>
            From intimate gatherings to grand celebrations, Gatherlii brings every vision to life.
          </p>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { text: '"Gatherlii transformed how I plan events. The vendor discovery alone saved me weeks of searching."', name: "Fatima Al-Khalifa", role: "Wedding Planner, Manama", initial: "F" },
              { text: '"The guest management tools are extraordinary. Everything I needed in one elegant platform."', name: "Ahmad Al-Rashid", role: "Corporate Events, Dubai", initial: "A" },
              { text: '"I planned my entire wedding through Gatherlii. The experience was as beautiful as the day itself."', name: "Maryam Hassan", role: "Bride, Kuwait City", initial: "M" },
            ].map((t, i) => (
              <div
                key={t.name}
                className="rounded-[20px] p-7 border border-primary/5 hover:shadow-lg hover:-translate-y-1 transition-all"
                style={{ background: BLUSH }}
                data-reveal
              >
                <div className="text-amber-600 text-sm tracking-widest mb-3">★★★★★</div>
                <p className="font-cursive text-lg italic leading-relaxed mb-5" style={{ color: TEXT_MID }}>{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border border-primary/10" style={{ background: "linear-gradient(135deg, #e5dbd0, #ede4da)", color: PRIMARY }}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium" style={{ color: TEXT }}>{t.name}</div>
                    <div className="text-[11px] font-light" style={{ color: TEXT_MUTED }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gold line */}
        <div className="w-full h-px opacity-20" style={{ background: "linear-gradient(90deg, transparent 0%, #b8935a 30%, #6D0D35 60%, transparent 100%)" }} />

        {/* CTA */}
        <section className="py-16 md:py-24 lg:py-32 px-5 md:px-12 lg:px-20 relative overflow-hidden" style={{ background: BLUSH }}>
          <div className="absolute inset-0 pointer-events-none opacity-100" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(109,13,53,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(184,147,90,0.06) 0%, transparent 50%)" }} />
          <div className="relative text-center">
            <div className="font-cursive text-[160px] font-bold leading-none text-center mb-[-20px] select-none" style={{ color: "rgba(109,13,53,0.05)" }}>"</div>
            <h2 className="text-[clamp(38px,6vw,72px)] font-bold tracking-[-2px] leading-[1.05] mb-4" style={{ color: TEXT }} data-reveal>
              Plan your
              <br />
              <span className="italic font-light text-primary">first event</span>
            </h2>
            <p className="text-[clamp(14px,1.5vw,17px)] font-light max-w-[480px] mx-auto mb-10 leading-relaxed" style={{ color: TEXT_MUTED }} data-reveal>
              Join thousands of event planners using Gatherlii to create unforgettable experiences across the Gulf.
            </p>
            {!checking && !token && (
              <div className="flex flex-wrap justify-center gap-3 mb-5" data-reveal>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all hover:-translate-y-px"
                  style={{ background: PRIMARY, boxShadow: "0 4px 18px rgba(109,13,53,0.28)" }}
                >
                  Sign Up — It&apos;s Free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-normal border border-primary/20 hover:border-primary hover:text-primary transition-colors"
                  style={{ color: TEXT_MID }}
                >
                  Log In
                </Link>
              </div>
            )}
            <p className="text-xs font-light" style={{ color: TEXT_MUTED }} data-reveal>No credit card required · Set up in minutes</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-14 px-5 md:px-12 lg:px-20" style={{ background: TEXT, color: BLUSH }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
              <div>
                <Link href="/" className="block mb-3">
                  <Image src="/logo/logo1.png" alt="Gatherlii" width={120} height={32} className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
                </Link>
                <p className="text-[13px] font-light leading-relaxed max-w-[220px] opacity-70">
                  Premium event planning and coordination for unforgettable experiences across the Gulf region.
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-[2px] opacity-60 mb-4">Product</h4>
                <div className="flex flex-col gap-2.5">
                  <Link href="#how" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">How it Works</Link>
                  <Link href="/services/catering" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">Browse Vendors</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-[2px] opacity-60 mb-4">Company</h4>
                <div className="flex flex-col gap-2.5">
                  <Link href="#" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">About</Link>
                  <Link href="#" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">Contact</Link>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-medium uppercase tracking-[2px] opacity-60 mb-4">Support</h4>
                <div className="flex flex-col gap-2.5">
                  <Link href="#" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">Help Center</Link>
                  <Link href="#" className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between items-center gap-4">
              <p className="text-[12.5px] font-light opacity-50">© {new Date().getFullYear()} Gatherlii. All rights reserved.</p>
              <p className="text-[12.5px] font-light opacity-50">Crafted with care in Bahrain 🇧🇭</p>
            </div>
          </div>
        </footer>
      </main>

    </div>
  );
}
