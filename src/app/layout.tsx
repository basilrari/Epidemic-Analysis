import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epidemic Simulator v2.0 — Advanced Network SIR Modeling",
  description: "Explore how diseases spread across complex networks and evaluate intervention strategies in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0f] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
