import type { Metadata, Viewport } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PageTransition } from "@/components/PageTransition";
import { AppBootstrap } from "@/components/AppBootstrap";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppUpdatePrompt } from "@/components/AppUpdatePrompt";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "Gatherlii - Event Planning",
  description: "Plan your events with the best services in town",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gatherlii",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#6D0D35",
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
      <body className={`antialiased min-h-screen ${poppins.className} ${dancingScript.variable}`}>
        <OfflineBanner />
        <AppBootstrap>
          <PageTransition>{children}</PageTransition>
        </AppBootstrap>
        <InstallPrompt />
        <AppUpdatePrompt />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
