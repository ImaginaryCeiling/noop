import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        className={`${GeistSans.className} antialiased`}
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
