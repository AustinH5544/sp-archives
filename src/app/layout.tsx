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
    default: "SP-ARCHIVES — Skyelar Payne · Pacific Northwest Photography",
    template: "%s · SP-ARCHIVES",
  },
  description:
    "SP-ARCHIVES is the photography archive of Skyelar Payne, covering documentary, portrait, automotive, and wildlife work across the Pacific Northwest and North Idaho. Family, maternity, graduation, and automotive sessions.",
  keywords: [
    "Skyelar Payne",
    "SP-ARCHIVES",
    "Pacific Northwest photographer",
    "automotive photography",
    "documentary portrait photographer",
    "family photographer PNW",
    "maternity photographer",
    "North Idaho photographer",
  ],
  authors: [{ name: "Skyelar Payne" }],
  openGraph: {
    title: "SP-ARCHIVES — Skyelar Payne",
    description:
      "Documentary, portrait, and automotive photography across the Pacific Northwest, by Skyelar Payne.",
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
