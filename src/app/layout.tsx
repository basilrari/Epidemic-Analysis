import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epidemic Spreading on Complex Networks — PBL Demonstration",
  description: "Interactive PBL demonstration of SIR epidemic simulation on graph networks. Explore topology effects and targeted intervention strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0b0f1a] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
