import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriageAI — AI-Assisted Patient Triage",
  description: "AI-assisted hospital patient triage system powered by Claude. Demo purposes only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
