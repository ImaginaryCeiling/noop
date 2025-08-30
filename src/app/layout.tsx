import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Channel Notes",
  description: "A Discord-style channel-based note-taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans`}
      >
        <AppStateProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AppStateProvider>
        <Analytics />
      </body>
    </html>
  );
}
