"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CreditCard, Plus, Trash } from "@phosphor-icons/react";
import { AppLayout } from "@/components/AppLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchMethods() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
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
      if (!res.ok) throw new Error(data.error || "Failed to add card");
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
      <header className="sticky top-0 z-40 bg-white/80 ios-blur px-6 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-slate-500 hover:text-slate-700"
            aria-label="Back"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Payment methods</h1>
        </div>
      </header>

      <main className="p-6 pb-32 space-y-6">
        <p className="text-slate-500 text-sm">
          Add cards for quick checkout. Use dummy numbers like 4242424242424242.
        </p>

        <form onSubmit={handleAddCard} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Card number (e.g. 4242…)"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
            className="flex-1 px-4 py-3 rounded-md border border-slate-200 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={adding || cardNumber.replace(/\D/g, "").length < 13}
            className="px-4 py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            Add
          </button>
        </form>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12 rounded-md border border-slate-200 bg-white">
            <CreditCard size={48} weight="regular" className="text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4 font-medium">No saved cards</p>
            <p className="text-slate-400 text-sm mt-1">Add a card above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-md border border-slate-200 bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                    <CreditCard size={20} weight="regular" className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 capitalize">{m.brand}</p>
                    <p className="text-slate-500 text-sm">•••• {m.last4}</p>
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
