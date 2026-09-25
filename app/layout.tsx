import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalNavbar from "@/components/navigation/GlobalNavbar"; // assuming standard alias, or relative path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NileChess – Play Chess Online",
  description: "A professional chess platform. Play, analyze and learn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <GlobalNavbar />
        {children}
      </body>
    </html>
  );
}
