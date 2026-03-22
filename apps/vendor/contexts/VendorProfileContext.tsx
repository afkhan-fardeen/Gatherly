"use client";

import { createContext, useContext } from "react";

/** Subset of GET /api/vendor/me used for vendor shell header (from dashboard layout probe). */
export interface VendorProfileMe {
  businessName?: string | null;
  user?: { name?: string | null; profilePictureUrl?: string | null };
}

const VendorProfileContext = createContext<VendorProfileMe | null>(null);

export function VendorProfileProvider({
  value,
  children,
}: {
  value: VendorProfileMe | null;
  children: React.ReactNode;
}) {
  return <VendorProfileContext.Provider value={value}>{children}</VendorProfileContext.Provider>;
}

export function useVendorProfile() {
  return useContext(VendorProfileContext);
}
