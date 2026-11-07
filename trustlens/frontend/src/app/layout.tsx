import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MetricTicker } from '../components/layout/MetricTicker';

export const metadata: Metadata = {
  title: 'TrustLens — Explainable Cyber Threat Intelligence & Digital Trust Verification',
  description:
    'Real-time multi-signal analysis verifying X.509 certificate chains, detecting Fermat-factorable keys, flagging CCADB CA distrusts, and catching brand phishing clones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <MetricTicker />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

