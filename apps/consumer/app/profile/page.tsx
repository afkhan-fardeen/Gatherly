"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CalendarCheck,
  ForkKnife,
  CreditCard,
  Receipt,
  Bell,
  SignOut,
  CaretRight,
  Calendar,
  User,
  Question,
  PencilSimple,
} from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";
import { API_URL } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
}

interface EventSummary {
  total: number;
  upcoming: number;
  totalGuests: number;
}

const QUICK_ACCESS = [
  { href: "/services/catering", icon: ForkKnife, label: "Browse Catering", sublabel: "Find catering for your events", iconClass: "bg-emerald-500/10 text-emerald-700" },
  { href: "/events", icon: Calendar, label: "My Events", sublabel: "Manage all your gatherings", iconClass: "bg-primary/10 text-primary", badge: true },
  { href: "/bookings", icon: CalendarCheck, label: "My Bookings", sublabel: "Catering orders and payments", iconClass: "bg-amber-500/10 text-amber-700" },
] as const;

const ACCOUNT_ITEMS = [
  { href: "/profile/payment-methods", icon: CreditCard, label: "Payment Methods", sublabel: "Cards and billing", iconClass: "bg-blue-500/10 text-blue-700" },
  { href: "/profile/payment-history", icon: Receipt, label: "Payment History", sublabel: "Past transactions", iconClass: "bg-amber-500/10 text-amber-700" },
  { href: "/profile/edit", icon: User, label: "Personal Info", sublabel: "Name, email, phone", iconClass: "bg-primary/10 text-primary" },
] as const;

const SETTINGS_ITEMS = [
  { href: "/notifications", icon: Bell, label: "Notifications", sublabel: "Alerts and preferences", iconClass: "bg-primary/10 text-primary" },
] as const;

const SUPPORT_ITEMS = [
  { href: "#", icon: Question, label: "Help & Support", sublabel: "FAQs, contact us", iconClass: "bg-primary/10 text-primary" },
] as const;

function MenuCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[20px] overflow-hidden"
      style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
    >
      {children}
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  sublabel,
  iconClass,
  badge,
  onClick,
  danger,
}: {
  href?: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  iconClass: string;
  badge?: number;
  onClick?: () => void;
  danger?: boolean;
}) {
  const content = (
    <>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={18} weight="regular" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[14.5px] font-normal block ${danger ? "text-red-600" : "text-text-primary"}`}>{label}</span>
        {sublabel && <span className="text-xs text-text-tertiary font-light block mt-0.5">{sublabel}</span>}
      </div>
      {!danger && badge != null && badge > 0 && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white mr-1">{badge}</span>
      )}
      {!danger && (href || onClick) && <CaretRight size={16} weight="bold" className="text-slate-300 shrink-0" />}
    </>
  );

  const className = `flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-primary/5 active:bg-primary/10 ${danger ? "hover:bg-red-50/50 active:bg-red-50" : ""}`;

  if (onClick) {
    return <button type="button" onClick={onClick} className={`w-full text-left ${className}`}>{content}</button>;
  }
  if (href && href !== "#") {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return <div className={className}>{content}</div>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [events, setEvents] = useState<EventSummary>({ total: 0, upcoming: 0, totalGuests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/profile"));
      return;
    }
    Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([data, evs]) => {
        if (data) {
          setUser(data);
          const stored = localStorage.getItem("user");
          const merged = stored ? { ...JSON.parse(stored), ...data } : data;
          localStorage.setItem("user", JSON.stringify(merged));
        } else {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        }
        const list = Array.isArray(evs) ? evs : [];
        const now = new Date();
        const upcoming = list.filter((e: { date: string }) => new Date(e.date) >= now);
        const totalGuests = list.reduce((sum: number, e: { guestCount?: number }) => sum + (e.guestCount ?? 0), 0);
        setEvents({ total: list.length, upcoming: upcoming.length, totalGuests });
      })
      .catch(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  if (loading || !user) {
    return (
      <AppLayout contentBg="bg-[#f4ede5]">
        <div className="flex-1 flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}>
          <p className={TYPO.SUBTEXT}>{loading ? "Loading..." : "Please log in"}</p>
        </div>
      </AppLayout>
    );
  }

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="flex-1 min-h-[100dvh]"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        <header
          className="sticky top-0 z-40 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <Link
                href="/dashboard"
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
                style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
              >
                <ArrowLeft size={20} weight="regular" />
              </Link>
              <div>
                <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                  My <span className="italic font-normal text-primary">Profile</span>
                </h1>
                <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                  Your account and settings
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-32 space-y-6">
          {/* Profile card - no header image */}
          <section className="animate-fade-in-up">
            <div
              className="bg-white rounded-[20px] overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(109, 13, 53, 0.08)" }}
            >
              <div className="px-5 pt-6 pb-6">
                <div className="mb-4">
                  <Link href="/profile/edit" className="relative inline-block">
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden border-[3.5px] border-white bg-slate-100 flex items-center justify-center"
                      style={{ boxShadow: "0 4px 16px rgba(109, 13, 53, 0.18)" }}
                    >
                      {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[28px] font-medium text-primary">{initials.charAt(0)}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center border-2 border-white text-white hover:bg-primary/90 transition-colors">
                      <Camera size={11} weight="regular" />
                    </span>
                  </Link>
                </div>
                <h2 className="font-serif text-[22px] font-medium text-[#1e0f14] mb-0.5">{user.name}</h2>
                <p className="text-[13px] text-text-tertiary font-light mb-4">{user.email}</p>

                {/* Stats row */}
                <div className="flex rounded-[14px] py-3 mb-4" style={{ background: "#f4ede5" }}>
                  <div className="flex-1 text-center">
                    <span className="text-[20px] font-medium text-primary block leading-none mb-1">{events.total}</span>
                    <span className="text-[10px] font-normal text-text-tertiary uppercase tracking-wider">Events</span>
                  </div>
                  <div className="w-px bg-slate-200 self-stretch my-1" />
                  <div className="flex-1 text-center">
                    <span className="text-[20px] font-medium text-primary block leading-none mb-1">{events.upcoming}</span>
                    <span className="text-[10px] font-normal text-text-tertiary uppercase tracking-wider">Upcoming</span>
                  </div>
                  <div className="w-px bg-slate-200 self-stretch my-1" />
                  <div className="flex-1 text-center">
                    <span className="text-[20px] font-medium text-primary block leading-none mb-1">{events.totalGuests}</span>
                    <span className="text-[10px] font-normal text-text-tertiary uppercase tracking-wider">Guests</span>
                  </div>
                </div>

                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13.5px] font-normal text-white bg-primary hover:bg-primary/90 transition-all hover:-translate-y-px"
                  style={{ boxShadow: "0 4px 16px rgba(109, 13, 53, 0.28)" }}
                >
                  <PencilSimple size={13} weight="regular" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Access */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-2.5 pl-1">Quick Access</h3>
            <MenuCard>
              {QUICK_ACCESS.map((item, i) => (
                <div key={item.href} className={i < QUICK_ACCESS.length - 1 ? "border-b border-slate-100" : ""}>
                  <MenuItem href={item.href} icon={item.icon} label={item.label} sublabel={item.sublabel} iconClass={item.iconClass} badge={"badge" in item && item.badge ? events.upcoming : undefined} />
                </div>
              ))}
            </MenuCard>
          </section>

          {/* Account */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-2.5 pl-1">Account</h3>
            <MenuCard>
              {ACCOUNT_ITEMS.map((item, i) => (
                <div key={item.href} className={i < ACCOUNT_ITEMS.length - 1 ? "border-b border-slate-100" : ""}>
                  <MenuItem href={item.href} icon={item.icon} label={item.label} sublabel={item.sublabel} iconClass={item.iconClass} />
                </div>
              ))}
            </MenuCard>
          </section>

          {/* Settings */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-2.5 pl-1">Settings</h3>
            <MenuCard>
              {SETTINGS_ITEMS.map((item, i) => (
                <div key={item.href} className={i < SETTINGS_ITEMS.length - 1 ? "border-b border-slate-100" : ""}>
                  <MenuItem href={item.href} icon={item.icon} label={item.label} sublabel={item.sublabel} iconClass={item.iconClass} />
                </div>
              ))}
            </MenuCard>
          </section>

          {/* Support & Logout */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-2.5 pl-1">Support</h3>
            <MenuCard>
              {SUPPORT_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-slate-100">
                  <MenuItem href={item.href} icon={item.icon} label={item.label} sublabel={item.sublabel} iconClass={item.iconClass} />
                </div>
              ))}
              <MenuItem icon={SignOut} label="Sign Out" iconClass="bg-red-500/10 text-red-600" onClick={handleLogout} danger />
            </MenuCard>
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
