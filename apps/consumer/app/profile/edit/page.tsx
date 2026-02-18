"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Camera } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">{loading ? "Loading..." : "Please log in"}</p>
        </div>
      </AppLayout>
    );
  }

  const inputClass =
    "w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none";

  return (
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} weight="regular" className="text-slate-600" />
          </Link>
          <h1 className={TYPO.H1}>Edit profile</h1>
        </div>
      </header>

      <main className="p-6 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile image */}
          <div className="flex flex-col items-center">
            <label className={`${TYPO.FORM_LABEL} mb-2`}>Profile photo</label>
            <div className="relative">
              <div className="w-24 h-24 rounded-md border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
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
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90">
                <Camera size={16} weight="bold" />
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
          <div>
            <label className={`${TYPO.FORM_LABEL} mb-2`}>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="Your name"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className={`${TYPO.FORM_LABEL} mb-2`}>Email</label>
            <input
              type="email"
              value={form.email}
              readOnly
              className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
            />
            <p className={`${TYPO.CAPTION} mt-1`}>Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className={`${TYPO.FORM_LABEL} mb-2`}>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
              placeholder="e.g. +973 1234 5678"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </AppLayout>
  );
}
