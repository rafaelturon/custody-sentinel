/**
 * src/TrusteeView.js — Trustee / Lawyer Simulator
 *
 * Open this in a second tab via ?trustee=true
 * It generates its own Nostr keypair, connects to the same relays,
 * and listens for incoming NIP-46 handshake requests from the Advisor app.
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Zap,
  CheckCircle2,
  Copy,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  NostrProvider,
  useNostr,
  useTrusteeListener,
  truncateKey,
  RELAY_URLS,
} from './nostr';

// ============================================================================
//  Inner content (needs NostrProvider above it)
// ============================================================================

function TrusteeContent() {
  const { keypair, relayStatus, connectedCount, totalRelays, eventLog } = useNostr();
  const { requests, approve, approvedIds } = useTrusteeListener();
  const [copied, setCopied] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const copyNpub = () => {
    if (!keypair) return;
    navigator.clipboard.writeText(keypair.npub).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!keypair) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 flex items-center gap-3">
          <Radio className="w-5 h-5 animate-spin" /> Generating keypair…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                TRUSTEE SIMULATOR
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                LAWYER / CO-SIGNER VIEW
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLog(!showLog)}
              className="text-xs text-slate-500 hover:text-white transition-colors font-mono"
            >
              {showLog ? 'Hide' : 'Show'} Event Log
            </button>
            <div className="flex items-center gap-2 text-xs">
              {connectedCount > 0 ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="text-slate-400 font-mono">
                {connectedCount}/{totalRelays}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Step 1: Identity Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-[0.03] pointer-events-none">
            <Key className="w-40 h-40 text-emerald-500" />
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Step 1 — Your Trustee Identity
            </h2>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Your Public Key (npub)
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-emerald-400 text-xs font-mono bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 break-all select-all">
                  {keypair.npub}
                </code>
                <button
                  onClick={copyNpub}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Hex Pubkey
              </p>
              <code className="text-slate-400 text-[11px] font-mono break-all">
                {keypair.pk}
              </code>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-indigo-400">
                    Copy the npub above
                  </span>{' '}
                  and paste it into the Advisor app's Vault Configuration screen.
                  Then click "Orchestrate via Nostr" in the Advisor app. The
                  handshake request will appear below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Incoming Requests */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`w-2 h-2 rounded-full ${
                requests.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'
              }`}
            />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Step 2 — Incoming Handshake Requests
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-16">
              <Radio className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-500 text-sm">
                Listening for handshake requests on {connectedCount} relay
                {connectedCount !== 1 ? 's' : ''}…
              </p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono">
                kind:{24133} • #p:{truncateKey(keypair.pk, 6)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const isApproved = approvedIds.has(req.requestId);
                return (
                  <div
                    key={req.eventId}
                    className={`border rounded-xl p-5 transition-all ${
                      isApproved
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-amber-500/30 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-bold text-white">
                            Advisor Connection Request
                          </span>
                          {isApproved && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              APPROVED
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">
                              Advisor Pubkey
                            </p>
                            <code className="text-[11px] text-indigo-400 font-mono">
                              {truncateKey(req.advisorPk, 10)}
                            </code>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">
                              Request ID
                            </p>
                            <code className="text-[11px] text-slate-400 font-mono">
                              {req.requestId}
                            </code>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">
                              Event ID
                            </p>
                            <code className="text-[11px] text-slate-400 font-mono">
                              {truncateKey(req.eventId, 10)}
                            </code>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">
                              Timestamp
                            </p>
                            <code className="text-[11px] text-slate-400 font-mono">
                              {new Date(req.timestamp * 1000).toLocaleTimeString()}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isApproved ? (
                          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold">Linked</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => approve(req)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Relay Status */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Connected Relays
          </h3>
          <div className="space-y-2">
            {RELAY_URLS.map((url) => {
              const status = relayStatus[url] || 'connecting';
              return (
                <div
                  key={url}
                  className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg"
                >
                  <code className="text-xs font-mono text-slate-300">{url}</code>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status === 'connected'
                          ? 'bg-emerald-500'
                          : status === 'connecting'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Event Log (togglable) */}
        {showLog && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Raw Nostr Event Log
            </h3>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-64 overflow-y-auto font-mono text-[10px] space-y-1">
              {eventLog.length === 0 ? (
                <p className="text-slate-600">Waiting for events…</p>
              ) : (
                eventLog.map((e, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-600 shrink-0">{e.time}</span>
                    <span
                      className={`shrink-0 ${
                        e.direction === 'IN'
                          ? 'text-emerald-500'
                          : 'text-indigo-400'
                      }`}
                    >
                      {e.direction === 'IN' ? '◀' : '▶'}
                    </span>
                    <span className="text-slate-500 shrink-0">{e.relay}</span>
                    <span className="text-slate-400 break-all">{e.raw}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  Exported Wrapper (provides its own NostrProvider)
// ============================================================================

export default function TrusteeView() {
  return (
    <NostrProvider>
      <TrusteeContent />
    </NostrProvider>
  );
}
