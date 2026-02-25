"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Plus, Trash } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { API_URL, parseApiError } from "@/lib/api";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchMethods() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=" + encodeURIComponent("/profile/payment-methods"));
      return;
    }
    fetch(`${API_URL}/api/payment-methods`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setMethods(data.items ?? []))
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMethods();
  }, []);

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const num = cardNumber.replace(/\D/g, "");
    if (num.length < 13 || num.length > 19) {
      toast.error("Enter a valid card number (13–19 digits)");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ number: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(parseApiError(data) || "Failed to add card");
      toast.success("Card added");
      setCardNumber("");
      fetchMethods();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add card");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/payment-methods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove card");
      toast.success("Card removed");
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove card");
    } finally {
      setDeletingId(null);
    }
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
              aria-label="Back"
            >
              <ArrowLeft size={20} weight="regular" />
            </Link>
            <div>
              <h1 className="font-serif text-[28px] sm:text-[34px] font-medium leading-none tracking-[-0.8px] text-[#1e0f14]">
                Payment <span className="italic font-normal text-primary">Methods</span>
              </h1>
              <p className="text-[12.5px] font-light text-[#9e8085] mt-1 tracking-wide">
                Cards for quick checkout
              </p>
            </div>
          </div>
        </header>

      <main className="px-5 pb-40 space-y-6">
        {/* Add card form */}
        <div
          className="p-4 rounded-[20px] border border-primary/10 bg-white"
          style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
        >
          <p className="font-serif text-[14px] font-semibold text-[#5c3d47] mb-3">Add a card</p>
          <p className="text-[12px] font-normal text-[#a0888d] mb-3">
            Use dummy numbers like 4242 4242 4242 4242 for testing.
          </p>
          <form onSubmit={handleAddCard} className="form-no-zoom flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card number (e.g. 4242…)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
              className="flex-1 h-12 px-4 rounded-full border border-primary/10 text-[#1e0f14] placeholder:text-[#9e8085] bg-[#fdfaf7] focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={adding || cardNumber.replace(/\D/g, "").length < 13}
              className="h-12 px-5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors shrink-0"
              style={{ boxShadow: "0 4px 14px rgba(109,13,53,0.28)" }}
            >
              <Plus size={18} weight="bold" />
              Add
            </button>
          </form>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-white/60 rounded-[20px] animate-pulse border border-primary/5" />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 px-6 rounded-[20px] border border-dashed border-primary/15 bg-[#fdfaf7] text-center"
            style={{ minHeight: 200 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CreditCard size={32} weight="regular" className="text-primary" />
            </div>
            <p className="font-serif text-[18px] font-medium text-[#1e0f14]">No saved cards</p>
            <p className="text-[14px] font-light text-[#a0888d] mt-1">Add a card above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-serif text-[14px] font-semibold uppercase tracking-[2px] text-[#5c3d47] mb-2">
              Saved cards
            </p>
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3.5 p-4 rounded-[20px] border border-primary/10 bg-white transition-all hover:border-primary/20"
                style={{ boxShadow: "0 2px 16px rgba(109, 13, 53, 0.06)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard size={24} weight="regular" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[15px] font-semibold text-[#1e0f14] capitalize">{m.brand}</p>
                  <p className="text-[13px] font-normal text-[#a0888d]">•••• {m.last4}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#9e8085] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Remove card"
                >
                  <Trash size={18} weight="regular" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </AppLayout>
  );
}
