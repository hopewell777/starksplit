import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/PrivyProvider";
import { StarknetProvider } from "@/components/providers/StarknetProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarkSplit — Precision Split Payments on Starknet",
  description: "Split expenses and settle on-chain with precision and ease using account abstraction.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

import { MeshBackground } from "@/components/ui/MeshBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-void text-primary selection:bg-accent-purple/30 relative overflow-x-hidden">
        <MeshBackground />
        <StarknetProvider>
          <Providers>
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
            <Toaster position="bottom-right" richColors theme="dark" />
          </Providers>
        </StarknetProvider>
      </body>
    </html>
  );
}
