"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Camera } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO, INPUT } from "@/lib/events-ui";

import { API_URL } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profilePictureUrl: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setForm({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            profilePictureUrl: data.profilePictureUrl || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/upload/image?folder=profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, profilePictureUrl: data.url }));
        toast.success("Photo uploaded");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          profilePictureUrl: form.profilePictureUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      const merged = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(merged));
      toast.success("Profile updated");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
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

  return (
    <AppLayout contentBg="bg-[#f4ede5]">
      <div
        className="min-h-full"
        style={{ background: "linear-gradient(to bottom, #f4ede5 80%, #ede4da 100%)" }}
      >
        <header
          className="sticky top-0 z-40 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
          style={{ background: "linear-gradient(to bottom, #f4ede5 75%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-primary/10 text-[#1e0f14] transition-shadow hover:shadow-md"
              style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.06)" }}
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div>
              <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                Edit <span className="italic font-normal text-primary">Profile</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                Name, email, phone
              </p>
            </div>
          </div>
        </header>

      <main className="px-5 pb-40">
        <form onSubmit={handleSubmit} className="form-no-zoom space-y-6">
          {/* Profile image */}
          <div
            className="flex flex-col items-center p-6 rounded-[20px] border border-primary/10 bg-white"
            style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
          >
            <label className="font-serif text-[14px] font-semibold text-[#5c3d47] mb-2">Profile photo</label>
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[3px] border-white overflow-hidden bg-[#f4ede5] flex items-center justify-center shrink-0" style={{ boxShadow: "0 4px 16px rgba(109,13,53,0.12)" }}>
                {form.profilePictureUrl ? (
                  <img
                    src={form.profilePictureUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-2xl text-slate-500">
                    {form.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 border-2 border-white" style={{ boxShadow: "0 2px 8px rgba(109,13,53,0.3)" }}>
                <Camera size={18} weight="bold" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
            </div>
            {uploading && (
              <p className="text-slate-500 text-xs mt-2">Uploading...</p>
            )}
          </div>

          {/* Name */}
          <div className="p-4 rounded-[20px] border border-primary/10 bg-white" style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}>
            <label className="font-serif text-[14px] font-semibold text-[#5c3d47] mb-2 block">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={INPUT.PRIMARY}
              placeholder="Your name"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div className="p-4 rounded-[20px] border border-primary/10 bg-white" style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}>
            <label className="font-serif text-[14px] font-semibold text-[#5c3d47] mb-2 block">Email</label>
            <input
              type="email"
              value={form.email}
              readOnly
              className={`${INPUT.PRIMARY} bg-slate-100 text-slate-500 cursor-not-allowed`}
            />
            <p className={`${TYPO.CAPTION} mt-1`}>Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div className="p-4 rounded-[20px] border border-primary/10 bg-white" style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}>
            <label className="font-serif text-[14px] font-semibold text-[#5c3d47] mb-2 block">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={INPUT.PRIMARY}
              placeholder="e.g. +973 1234 5678"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
            style={{ boxShadow: "0 4px 16px rgba(109,13,53,0.28)" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
      </div>
    </AppLayout>
  );
}
