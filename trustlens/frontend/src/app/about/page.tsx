import React from 'react';
import { Card } from '../../components/ui/Card';
import { BookOpen, Cpu, ShieldCheck, Eye } from 'lucide-react';

export default function AboutMethodologyPage() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8 font-mono">
      {/* Title */}
      <div className="space-y-2 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>TECHNICAL WHITE PAPER &middot; SPECIFICATION 2.4</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight font-sans">
          The TrustLens Mathematical Framework &amp; Cryptanalytic Sieve
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
          An explainable, multi-signal methodology for evaluating the integrity of TLS certificates, detecting Fermat-factorable keys, and isolating phishing infrastructure.
        </p>
      </div>

      {/* Section 1: Fermat Factorization */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-sans">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>1. Fermat&apos;s Factorization &amp; RSA Key Degradation</span>
        </h2>

        <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-4 text-xs text-zinc-300 leading-relaxed">
          <p>
            Standard RSA key generation mandates choosing two large prime numbers, <em>p</em> and <em>q</em>, uniformly at random from a sufficiently large interval. When primes are chosen independently, |p - q| &asymp; &radic;N, rendering trial factorization via Fermat&apos;s difference of squares method computationally infeasible.
          </p>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 text-emerald-300">
            <div className="font-bold text-[11px] text-zinc-400 uppercase">Fermat&apos;s Formulation:</div>
            <div className="text-sm">
              N = a&sup2; - b&sup2; = (a - b)(a + b) = p &middot; q
            </div>
            <div className="text-[11px] text-zinc-400">
              Where a = &lceil;&radic;N&rceil;, &lceil;&radic;N&rceil; + 1, ... and we test whether a&sup2; - N = b&sup2; is a perfect square.
            </div>
          </div>

          <p>
            Due to pseudo-random generator flaws (e.g. in smartcards or flawed enterprise PKI software), when |p - q| &lt; 2<sup>16</sup>, the difference is so miniscule that a = &lceil;&radic;N&rceil; yields an exact integer square in fewer than 100 algebraic iterations. <strong>TrustLens automatically executes this sieve on all observed 2048/4096-bit public keys.</strong> If b&sup2; resolves within 100 iterations, the key is flagged as compromised with an immediate hard override (Score &le; 12).
          </p>
        </Card>
      </section>

      {/* Section 2: CCADB Distrust Baselining */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-sans">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>2. Root Program &amp; CCADB Trust Chain Linter</span>
        </h2>

        <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            A common attack vector and organizational vulnerability is reliance on intermediate CAs that have lost compliance status under the <strong>Common CA Database (CCADB)</strong> policy or Mozilla / Chromium root programs.
          </p>
          <p>
            A prominent real-world incident involved subordinate CAs issued under <em>eMudhra</em> and other national root hierarchies where cross-signatures permitted issuance outside audited constraint policies. TrustLens parses the complete path from End-Entity &rarr; Sub-CA &rarr; Root Trust Anchor against real-time Certificate Revocation Lists (CRL) and CCADB disclosure notices.
          </p>
        </Card>
      </section>

      {/* Section 3: Visual SSIM & DOM Phishing Detection */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-sans">
          <Eye className="w-5 h-5 text-rose-400" />
          <span>3. Visual Impersonation &amp; SSIM Fusion</span>
        </h2>

        <Card className="p-6 bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs text-zinc-300 leading-relaxed">
          <p>
            Modern phishing toolkits utilize randomized HTML classes and base64-encoded CSS to defeat naive string-matching regexes. TrustLens runs an isolated headless browser that renders the page at 1920&times;1080 resolution and calculates the Structural Similarity Index (SSIM) against canonical brand vector templates.
          </p>
          <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg text-rose-300 text-[11px]">
            <strong>Hard Boundary Trigger:</strong> If SSIM &ge; 0.85 and the DOM contains a form action submitting to a cross-origin endpoint (e.g. Telegram Bot webhook, untrusted IP), the target is declared a Critical Phishing Clone (Score &le; 05).
          </div>
        </Card>
      </section>
    </div>
  );
}
