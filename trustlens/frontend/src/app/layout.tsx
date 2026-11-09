import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  title: 'TrustLens — Enterprise Cyber Threat Intelligence & Digital Trust Verification',
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
      <body className="min-h-screen flex flex-col bg-tl-canvas text-tl-text-primary antialiased tl-desktop-canvas">
        <LanguageProvider>
          <Navbar />
          <div className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto border-x border-tl-border/40 shadow-panel">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
              {children}
            </main>
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
