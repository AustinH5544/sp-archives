import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sp-archives.com"),
  title: {
    default: "SP-ARCHIVES — Skyelar Payne · Editorial Photography Archive",
    template: "%s · SP-ARCHIVES",
  },
  description:
    "SP-ARCHIVES is the editorial photography archive of Skyelar Payne — a catalogued index of portrait, editorial, and place photography. Curated series, museum-grade prints, and commissions.",
  keywords: [
    "Skyelar Payne",
    "SP-ARCHIVES",
    "editorial photography",
    "portrait photographer",
    "photography archive",
    "fine art prints",
  ],
  authors: [{ name: "Skyelar Payne" }],
  openGraph: {
    title: "SP-ARCHIVES — Skyelar Payne",
    description:
      "An editorial photography archive. Catalogued series, portraiture, and place — by Skyelar Payne.",
    type: "website",
    siteName: "SP-ARCHIVES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${grotesk.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <SmoothScroll />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
