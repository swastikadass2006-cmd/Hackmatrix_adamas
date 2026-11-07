'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Shield, Lock, Key, ArrowRight } from 'lucide-react';

export default function OrgLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('soc.analyst@sbi.co.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/org/watchlist');
    }, 600);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 cyber-grid">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-zinc-950/90 border border-zinc-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Enterprise SOC Access Portal</h1>
          <p className="text-xs text-zinc-400">
            Authenticate to access organization brand lookalike telemetry, crt.sh certificate logs, and automated takedown dispatch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400">SOC Analyst Work Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@enterprise.domain"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400">Hardware Token / Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-mono text-xs"
              isLoading={isLoading}
            >
              <span>Authenticate &amp; Decrypt Session</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        <div className="pt-3 border-t border-zinc-900 text-center">
          <span className="text-[11px] font-mono text-zinc-500">
            Protected by WebAuthn FIDO2 &middot; Demo Mode Pre-filled
          </span>
        </div>
      </Card>
    </div>
  );
}

