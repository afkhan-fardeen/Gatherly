"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CreditCard, Plus, Trash } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";
import { TYPO } from "@/lib/events-ui";

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
    <AppLayout>
      <header className="sticky top-0 z-40 bg-white px-6 py-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-slate-200 bg-white flex items-center justify-center shrink-0 text-text-primary hover:bg-slate-50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={22} weight="regular" />
          </Link>
          <h1 className={`${TYPO.H1} text-text-primary`}>Payment methods</h1>
        </div>
      </header>

      <main className="p-6 pb-32 space-y-6 bg-[var(--bg-app)]">
        <p className={TYPO.SUBTEXT}>
          Add cards for quick checkout. Use dummy numbers like 4242424242424242.
        </p>

        <form onSubmit={handleAddCard} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Card number (e.g. 4242…)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
            className="flex-1 px-4 py-3 rounded-full border border-slate-200 text-text-primary placeholder:text-text-tertiary bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={adding || cardNumber.replace(/\D/g, "").length < 13}
            className="px-4 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Plus size={18} weight="bold" />
            Add
          </button>
        </form>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white shadow-elevation-1">
            <CreditCard size={40} weight="regular" className="text-slate-300 mx-auto" />
            <p className={`${TYPO.SUBTEXT} mt-4 font-medium`}>No saved cards</p>
            <p className={`${TYPO.SUBTEXT} mt-1`}>Add a card above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-elevation-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CreditCard size={22} weight="regular" className="text-slate-500" />
                  </div>
                  <div>
                    <p className={`${TYPO.CARD_TITLE} capitalize`}>{m.brand}</p>
                    <p className={TYPO.SUBTEXT}>•••• {m.last4}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  aria-label="Remove card"
                >
                  <Trash size={18} weight="regular" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
