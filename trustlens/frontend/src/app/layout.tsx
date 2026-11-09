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
          <div className="w-full max-w-[1600px] mx-auto px-0 sm:px-4 flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 flex overflow-hidden w-full sm:rounded-2xl border sm:border-white/[0.07] shadow-[0_20px_60px_rgba(0,0,0,0.7)] bg-[#0A101A]/80 backdrop-blur-xl my-0 sm:my-3">
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
