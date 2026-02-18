import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PageTransition } from "@/components/PageTransition";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gatherly - Event Planning",
  description: "Plan your events with the best services in town",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gatherly",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={`antialiased min-h-screen ${montserrat.className}`}>
        <PageTransition>{children}</PageTransition>
        <InstallPrompt />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
