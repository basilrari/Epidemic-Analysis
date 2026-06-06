import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epidemic Simulator — Network SIR",
  description: "Interactive SIR epidemic simulation on complex networks. Compare intervention strategies in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
