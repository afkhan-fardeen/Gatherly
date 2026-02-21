"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User,
  Envelope,
  Phone,
  Calendar,
  MapPin,
  Package,
  Clock,
  Check,
  X,
  CookingPot,
  Truck,
  CheckCircle,
} from "@phosphor-icons/react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { VendorLayout } from "@/components/VendorLayout";
import { PageHeader } from "@/components/PageHeader";

import { API_URL } from "@/lib/api";

interface BookingDetail {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string | null;
  guestCount: number;
  totalAmount: string;
  specialRequirements: string | null;
  user: { name: string; email: string; phone: string | null };
  event: {
    name: string;
    date: string;
    timeStart: string | null;
    timeEnd: string | null;
    guestCount: number;
    location: string;
    venueType: string | null;
    venueName: string | null;
    specialRequirements: string | null;
  };
  package: {
    name: string;
    basePrice: string;
    imageUrl: string | null;
    packageItems: { name: string; description: string | null; category: string | null }[];
  };
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/vendor/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setBooking(data);
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  type StatusAction = "confirmed" | "cancelled" | "in_preparation" | "delivered" | "completed";

  async function updateStatus(status: StatusAction) {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/vendor/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setBooking((b) => (b ? { ...b, status } : null));
      const messages: Record<StatusAction, string> = {
        confirmed: "Booking confirmed",
        cancelled: "Booking declined",
        in_preparation: "Order is being prepared",
        delivered: "Marked as delivered",
        completed: "Booking completed",
      };
      toast.success(messages[status]);
      if (status === "confirmed") router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded-lg w-48" />
            <div className="h-64 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (error || !booking) {
    return (
      <VendorLayout>
        <div>
          <PageHeader
            title="Booking"
            backLink={{ href: "/bookings", label: "Back to bookings" }}
          />
          <div className="p-6 rounded-xl bg-red-50 text-red-600 border border-red-100">
            {error || "Booking not found"}
          </div>
        </div>
      </VendorLayout>
    );
  }

  const BOOKING_STEPS = [
    { label: "Pending" },
    { label: "Confirmed" },
    { label: "Preparing" },
    { label: "Delivered" },
    { label: "Completed" },
  ];
  const statusToStep: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    in_preparation: 3,
    delivered: 4,
    completed: 5,
  };
  const currentStep = statusToStep[booking.status] ?? 1;

  const specialReqs =
    booking.specialRequirements || booking.event.specialRequirements || null;
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";
  const isInPrep = booking.status === "in_preparation";
  const isDelivered = booking.status === "delivered";

  function StatusActions() {
    if (isPending) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateStatus("confirmed")}
            disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check size={18} weight="bold" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => updateStatus("cancelled")}
            disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 disabled:opacity-50"
          >
            <X size={18} weight="bold" />
            Decline
          </button>
        </div>
      );
    }
    if (isConfirmed) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateStatus("in_preparation")}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200 disabled:opacity-50"
            title="You're starting to prepare the order"
          >
            <CookingPot size={18} weight="bold" />
            Preparing order
          </button>
          <button
            type="button"
            onClick={() => updateStatus("cancelled")}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 disabled:opacity-50"
          >
            <X size={18} weight="bold" />
            Cancel
          </button>
        </div>
      );
    }
    if (isInPrep) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 disabled:opacity-50"
            title="Food has been delivered to the event"
          >
            <Truck size={18} weight="bold" />
            Delivered to customer
          </button>
        </div>
      );
    }
    if (isDelivered) {
      return (
        <button
          type="button"
          onClick={() => updateStatus("completed")}
          disabled={updating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 disabled:opacity-50"
          title="Close this booking and allow the customer to leave a review"
        >
          <CheckCircle size={18} weight="bold" />
          Complete & close
        </button>
      );
    }
    return null;
  }

  return (
    <VendorLayout>
      <div className="max-w-5xl mx-auto w-full">
        <PageHeader
          title={booking.event.name}
          subtitle={
            <span className="flex items-center gap-2">
              <span>Booking {booking.bookingReference} · {booking.status.replace(/_/g, " ")}</span>
              {booking.status === "confirmed" && (
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                    (booking.paymentStatus || "unpaid") === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {(booking.paymentStatus || "unpaid") === "paid" ? "Paid" : "Awaiting payment"}
                </span>
              )}
            </span>
          }
          backLink={{ href: "/bookings", label: "Back to bookings" }}
          action={<StatusActions />}
        />

        {booking.status !== "cancelled" && (
          <div className="mb-6">
            <StepIndicator steps={BOOKING_STEPS} currentStep={currentStep} />
          </div>
        )}

        <div className="space-y-6">
          <section className="p-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User size={20} weight="regular" />
              Consumer
            </h2>
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">{booking.user.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${booking.user.email}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <Envelope size={14} />
                    {booking.user.email}
                  </a>
                </dd>
              </div>
              {booking.user.phone && (
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${booking.user.phone}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone size={14} />
                      {booking.user.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="p-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={20} weight="regular" />
              Event
            </h2>
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-slate-500">Date</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(booking.event.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Time</dt>
                <dd className="font-medium text-slate-900">
                  {formatTime(booking.event.timeStart)} – {formatTime(booking.event.timeEnd)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Guests</dt>
                <dd className="font-medium text-slate-900">{booking.guestCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium text-slate-900 flex items-start gap-1">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  {booking.event.location}
                  {booking.event.venueName && ` · ${booking.event.venueName}`}
                </dd>
              </div>
            </dl>
          </section>

          <section className="p-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={20} weight="regular" />
              Package
            </h2>
            <div className="flex items-start gap-4">
              {booking.package.imageUrl && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={booking.package.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">{booking.package.name}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {parseFloat(booking.totalAmount).toLocaleString()} BD total
                </p>
              </div>
            </div>
            {booking.package.packageItems.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Menu items</h3>
                <ul className="space-y-1.5">
                  {booking.package.packageItems.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-medium">{item.name}</span>
                      {item.category && (
                        <span className="text-slate-500 ml-2">({item.category})</span>
                      )}
                      {item.description && (
                        <span className="block text-slate-500 text-xs mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {specialReqs && (
            <section className="p-6 rounded-xl border border-slate-200 bg-white">
              <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Clock size={20} weight="regular" />
                Special requirements
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap">{specialReqs}</p>
            </section>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
