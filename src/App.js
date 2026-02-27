import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import {
  Users,
  Plus,
  Shield,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Search,
  ChevronRight,
  Database,
  ArrowRight,
  Lock,
  Zap,
  Clock,
  ExternalLink,
  MoreVertical,
  Activity,
  History,
  Filter,
  Download,
  Share2,
  Bell,
  Fingerprint,
  Smartphone,
  ShieldCheck,
  ChevronLeft,
  Key,
  Code,
  Copy,
  Info,
  Link,
  RefreshCw,
  Terminal,
  Wifi,
  WifiOff,
  Eye,
  Settings,
  Radio,
} from 'lucide-react';
import {
  NostrProvider,
  useNostr,
  useHandshake,
  truncateKey,
  RELAY_URLS,
} from './nostr';

// --- Constants & Mock Data ---

const RISK_LEVELS = [
  { id: 'low', label: 'Conservative', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { id: 'medium', label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' },
  { id: 'high', label: 'Aggressive', color: 'bg-rose-500', text: 'text-rose-400' },
];

const INITIAL_CLIENTS = [
  {
    id: 'c1',
    name: 'Satoshi Nakamoto (Trust)',
    region: 'EU (Spain)',
    risk: 'medium',
    assets: '50.5 BTC',
    type: 'Self-Custody',
    status: 'Plan Approved',
    lastActive: '2 hours ago',
    compliance: 'Verified',
  },
  {
    id: 'c2',
    name: 'Estate of Hal Finney',
    region: 'EU (Germany)',
    risk: 'low',
    assets: '12.0 BTC',
    type: 'Hardware Wallet',
    status: 'Awaiting Review',
    lastActive: '10 mins ago',
    compliance: 'Pending',
  },
];

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
      </div>
      <div className="p-2 bg-indigo-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-xs">
        <span className={trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>
        <span className="text-slate-500 ml-1">vs last month</span>
      </div>
    )}
  </div>
);

const DAGNode = ({ title, status, agent, description, icon: Icon, isLast }) => {
  const statusColors = {
    completed: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    processing: 'border-indigo-500 text-indigo-400 bg-indigo-500/10 animate-pulse',
    pending: 'border-slate-700 text-slate-500 bg-slate-800/50',
    failed: 'border-rose-500 text-rose-400 bg-rose-500/10',
  };
  return (
    <div className="relative flex flex-col items-center">
      <div className={`w-full max-w-xs p-4 rounded-xl border-2 ${statusColors[status]} transition-all duration-300 shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">{agent}</span>
        </div>
        <h4 className="font-semibold text-white text-sm">{title}</h4>
        <p className="text-[10px] mt-1 text-slate-400 leading-tight">{description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] font-mono opacity-60">ID: {Math.random().toString(36).substr(2, 5)}</span>
          {status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
        </div>
      </div>
      {!isLast && (
        <div className="h-8 w-px bg-slate-700 my-2 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-t-4 border-x-4 border-x-transparent border-t-slate-700"></div>
        </div>
      )}
    </div>
  );
};

// --- Inner App (wrapped in NostrProvider) ---

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizationState, setFinalizationState] = useState({
    active: false,
    step: 'choice',
    type: null,
    planId: null,
  });
  const [showEventLog, setShowEventLog] = useState(false);

  // ─── Nostr Context ───
  const nostr = useNostr();
  const handshake = useHandshake();

  // ─── Agent flow (keep simulated for now — focus is trustee) ───
  const [agentOrchestration, setAgentOrchestration] = useState('idle');
  const startAgentInitialization = () => {
    setAgentOrchestration('connecting');
    setTimeout(() => {
      setAgentOrchestration('verified');
      setTimeout(() => setAgentOrchestration('live'), 3000);
    }, 2000);
  };

  // ─── PDF Generation ───
  const generatePolicyPDF = (policyNum) => {
    const doc = new jsPDF();
    const id = 1024 + policyNum;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const pk = nostr?.keypair?.pk || 'N/A';

    // Header bar
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 38, 'F');
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 38, 210, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AI SENTINEL', 20, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Institutional Custody Platform  |  V0.1-MVP-BETA', 20, 27);
    doc.text(`Generated: ${now}`, 20, 33);

    // Title
    let y = 55;
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Institutional Custody Policy #${id}`, 20, y);

    // Status badge
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(20, y + 6, 35, 7, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('SENTINEL VERIFIED', 22.5, y + 11);

    // Section: Policy Summary
    y += 25;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, y, 190, y);
    y += 10;
    doc.setTextColor(71, 85, 105); // slate-500
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('POLICY SUMMARY', 20, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const rows = [
      ['Policy ID', `#${id}`],
      ['Classification', 'Bitcoin Inheritance & Custody — Institutional Grade'],
      ['Compliance Framework', 'MiCA (Markets in Crypto-Assets Regulation)'],
      ['Jurisdiction', 'European Union — Spain'],
      ['Risk Profile', policyNum === 1 ? 'Moderate' : policyNum === 2 ? 'Conservative' : 'Aggressive'],
      ['Custody Logic', 'Self-Custody (Hardware Wallet)'],
      ['Advisor Nostr PK', pk.slice(0, 32) + '...'],
    ];

    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.text(value, 75, y);
      y += 8;
    });

    // Section: Vault Architecture
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    y += 10;
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('VAULT ARCHITECTURE', 20, y);

    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');

    const vaultLines = [
      'Spending Policy:  2-of-3 Multi-signature (Miniscript)',
      'Key 1 (Primary):  Client hardware wallet — full control',
      'Key 2 (Heir):     Specified successor — timelocked',
      'Key 3 (Trustee):  Lawyer / recovery signer — async via Nostr (NIP-46)',
      '',
      'Recovery Timelock: 52,560 blocks (~1 year)',
      'Notification:      NIP-59 Gift-Wrapped PSBT delivery',
    ];

    vaultLines.forEach((line) => {
      if (line === '') { y += 3; return; }
      doc.text(line, 20, y);
      y += 6;
    });

    // Descriptor box
    y += 6;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(18, y - 2, 174, 18, 2, 2, 'F');
    doc.setFontSize(6.5);
    doc.setFont('courier', 'normal');
    doc.setTextColor(16, 185, 129);
    const desc = `wsh(thresh(2,pk([0f0569ed/84'/1'/0']tpub.../0/*),pk([d2f.../0/*),and_v(v:pk(TRUSTEE_PK),after(52560))))`;
    doc.text(desc, 22, y + 5);
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text('Output Descriptor (Miniscript)', 22, y + 12);

    // Section: AI Swarm Verification
    y += 28;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    y += 10;
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AI SENTINEL SWARM VERIFICATION', 20, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const agents = [
      ['Manager Agent', 'Workflow decomposition via A2A protocol', 'PASS'],
      ['Market Analyst', 'Mempool density & liquidity scan', 'PASS'],
      ['Compliance Agent', 'MiCA Recital 83 non-custodality validation', 'PASS'],
      ['Sentinel (Rust)', 'Deterministic miniscript verification', 'PASS'],
    ];

    agents.forEach(([agent, desc, status]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(agent, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(desc, 62, y);
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text(status, 175, y);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      y += 7;
    });

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Sentinel V0.1-MVP-BETA  |  This document was generated programmatically and does not constitute legal advice.', 20, 277);
    doc.text(`Policy #${id}  |  Page 1 of 1`, 165, 277);

    doc.save(`custody-policy-${id}.pdf`);
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // AI generation simulation
  useEffect(() => {
    if (isGenerating) {
      const timer = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev >= 4) { clearInterval(timer); return prev; }
          return prev + 1;
        });
      }, 2000);
      return () => clearInterval(timer);
    } else {
      setGenerationStep(0);
    }
  }, [isGenerating]);

  // ─── Open Trustee Demo in new tab ───
  const openTrusteeTab = () => {
    window.open(window.location.origin + '?trustee=true', '_blank');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════════════════════════════════════════

  const renderSidebar = () => (
    <div className="w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">AI SENTINEL</h1>
          <p className="text-[10px] text-slate-500 font-mono">V0.1-MVP-BETA</p>
        </div>
      </div>

      {/* Relay status pill */}
      <div className="px-2 mb-6">
        <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
          {nostr?.connectedCount > 0 ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="text-[10px] font-mono text-slate-400">
            {nostr?.connectedCount || 0}/{nostr?.totalRelays || 0} Relays
          </span>
          <div
            className={`ml-auto w-1.5 h-1.5 rounded-full ${
              nostr?.connectedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {[
          { id: 'dashboard', label: 'Advisor Console', icon: BarChart3 },
          { id: 'clients', label: 'Client Portfolios', icon: Users },
          { id: 'intelligence', label: 'Agent Swarm', icon: Cpu },
          { id: 'history', label: 'Audit Trail', icon: History },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setFinalizationState({ active: false, step: 'choice', type: null, planId: null });
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Trustee Demo launcher */}
      <button
        onClick={openTrusteeTab}
        className="mb-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        Open Trustee Demo
      </button>

      {/* Event log toggle */}
      <button
        onClick={() => setShowEventLog(!showEventLog)}
        className="mb-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono text-slate-500 hover:text-white hover:bg-slate-900 transition-colors"
      >
        <Radio className="w-3 h-3" />
        {showEventLog ? 'Hide' : 'Show'} Event Log
      </button>

      {/* User card */}
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
            CA
          </div>
          <div>
            <p className="text-xs font-bold text-white">Beckham Advisor</p>
            <p className="text-[10px] text-emerald-400">Subscription Active</p>
          </div>
        </div>
        {nostr?.keypair && (
          <p className="text-[9px] font-mono text-slate-600 break-all mb-2">
            npub: {truncateKey(nostr.keypair.pk, 6)}
          </p>
        )}
        <button className="w-full text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-colors">
          Manage Billing (€250/mo)
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  VAULT CONFIGURATION (with REAL Nostr Handshake)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderVaultConfig = () => {
    const timelockOptions = [
      { label: '6 Months', value: '26280' },
      { label: '1 Year', value: '52560' },
      { label: '2 Years', value: '105120' },
    ];

    const trusteePkDisplay =
      handshake.state === 'linked' && handshake.trusteePk
        ? `[${truncateKey(handshake.trusteePk, 6)}/0/*`
        : 'TRUSTEE_XPUB_PENDING';

    const miniscript = `wsh(thresh(2,pk([0f0569ed/84'/1'/0']tpub.../0/*),pk([d2f.../0/*),and_v(v:pk(${trusteePkDisplay}),after(52560))))`;

    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <header className="flex items-center gap-4">
          <button
            onClick={() => {
              setFinalizationState((prev) => ({ ...prev, step: 'choice' }));
              handshake.reset();
            }}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Vault Configuration</h2>
            <p className="text-slate-400 text-sm">Define spending paths and timelocks for inheritance logic.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Participant Mapping */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Participant Mapping
              </h3>

              <div className="space-y-4">
                {/* Primary Key */}
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Primary Key</p>
                      <p className="text-[10px] text-slate-500">Consultant / Client Main Hardware</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">Full Control</span>
                </div>

                {/* Heir Key */}
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Heir Key</p>
                      <p className="text-[10px] text-slate-500">Specified Successor Wallet</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">LTV Locked</span>
                </div>

                {/* ── TRUSTEE KEY — with REAL Nostr Handshake ── */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Trustee / Lawyer</p>
                        <p className="text-[10px] text-slate-500">Asynchronous Recovery Signer via Nostr</p>
                      </div>
                    </div>

                    {/* Status badges */}
                    {handshake.state === 'linked' && (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <Link className="w-3 h-3" />
                        Linked: {truncateKey(handshake.trusteePk, 6)}
                      </div>
                    )}
                    {handshake.state === 'timeout' && (
                      <div className="flex items-center gap-2 text-[10px] text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Timed out
                      </div>
                    )}
                  </div>

                  {/* npub input + action button */}
                  {handshake.state !== 'linked' && (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Paste trustee npub1… or hex pubkey"
                        value={handshake.trusteeInput}
                        onChange={(e) => handshake.setTrusteeInput(e.target.value)}
                        disabled={handshake.state !== 'idle' && handshake.state !== 'timeout'}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
                      />

                      {(handshake.state === 'idle' || handshake.state === 'timeout') && (
                        <button
                          onClick={() => handshake.startHandshake(handshake.trusteeInput)}
                          disabled={!handshake.trusteeInput.trim()}
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-bold px-4 py-2 rounded-lg border border-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <Zap className="w-3 h-3" /> Orchestrate via Nostr
                        </button>
                      )}
                    </div>
                  )}

                  {/* Live status indicators */}
                  {handshake.state === 'requesting' && (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-mono animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Publishing kind:24133 to {nostr?.connectedCount} relay{nostr?.connectedCount !== 1 ? 's' : ''}…
                    </div>
                  )}
                  {handshake.state === 'verifying' && (
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono">
                      <Smartphone className="w-3 h-3" />
                      Awaiting trustee approval (NIP-46 handshake pending)…
                    </div>
                  )}

                  {/* Linked — show trustee details */}
                  {handshake.state === 'linked' && handshake.linkedEvent && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 space-y-1">
                      <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                        Nostr Handshake Complete
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Event ID: {truncateKey(handshake.linkedEvent.id, 10)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Trustee PK: {truncateKey(handshake.trusteePk, 10)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timelock */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Recovery Path Timelock
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {timelockOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      opt.label === '1 Year'
                        ? 'border-amber-500/50 bg-amber-500/5 text-amber-400 shadow-amber-500/5 shadow-lg'
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-sm font-bold">{opt.label}</p>
                    <p className="text-[10px] font-mono mt-1">{opt.value} Blocks</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output Descriptor panel */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <Code className="w-32 h-32 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Output Descriptor
              </h3>
              <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-emerald-500/80 leading-relaxed relative group shadow-inner">
                <div className="break-all whitespace-pre-wrap">{miniscript}</div>
                <button className="absolute bottom-4 right-4 p-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100">
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <button
                  disabled={handshake.state !== 'linked'}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${
                    handshake.state === 'linked'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {handshake.state === 'linked' ? 'Broadcast & Setup Vault' : 'Await Nostr Co-signer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  AGENTIC FIREWALL (kept simulated — out of scope for 3hr sprint)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderAgenticFirewallConfig = () => {
    const policyDescriptor = `wsh(thresh(2,pk(USER_KEY),pk(AGENT_OPENCLAW_01),or_v(and_v(v:pk(USER_KEY),after(144)),pk(USER_RECOVERY))))`;

    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <header className="flex items-center gap-4">
          <button
            onClick={() => setFinalizationState((prev) => ({ ...prev, step: 'choice' }))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">OpenClaw Firewall Setup</h2>
            <p className="text-slate-400 text-sm">Empower AI agents with limited treasury autonomy via BDK policies.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" /> Agent Identity & Link
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">OpenClaw-01 (Autonomous)</p>
                    <p className="text-[10px] text-slate-500 font-mono">NIP-05: agent01@openclaw.ai</p>
                  </div>
                </div>
                {agentOrchestration === 'idle' && (
                  <button
                    onClick={startAgentInitialization}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                  >
                    Connect Agent
                  </button>
                )}
                {agentOrchestration === 'connecting' && (
                  <span className="text-xs text-amber-400 flex items-center gap-2 font-mono animate-pulse">
                    <Wifi className="w-3 h-3" /> Initializing Relay Tunnel...
                  </span>
                )}
                {agentOrchestration === 'verified' && (
                  <span className="text-xs text-emerald-400 flex items-center gap-2 font-mono">
                    <ShieldCheck className="w-3 h-3" /> Identity Verified
                  </span>
                )}
                {agentOrchestration === 'live' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <Activity className="w-3 h-3" /> Agent Live & Paired
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Micro-autonomy Threshold</label>
                  <div className="flex items-center gap-3">
                    <input type="range" className="flex-1 accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                    <span className="text-xs font-mono text-white">50,000 sats</span>
                  </div>
                  <p className="text-[9px] text-slate-500">Agent signs solo for spends below this amount.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Escalation Notification</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-300">Push via NIP-59 (Gift Wrap)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" /> Financial Intent Monitor
              </h3>
              <div className="space-y-3">
                {[
                  { intent: 'Server Hosting Payment', amount: '12,500 sats', status: 'AUTO-APPROVE', time: 'Policy Valid' },
                  { intent: 'Domain Renewal', amount: '8,200 sats', status: 'AUTO-APPROVE', time: 'Policy Valid' },
                  { intent: 'Hardware Upgrade', amount: '1,200,000 sats', status: 'ESCALATION REQUIRED', time: 'Limit Exceeded' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-white">{item.intent}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[9px] font-bold ${item.status.includes('AUTO') ? 'text-emerald-400' : 'text-amber-400'}`}>{item.status}</p>
                      <p className="text-[9px] text-slate-600">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
              <div className="absolute -left-4 -bottom-4 opacity-5 pointer-events-none">
                <Settings className="w-32 h-32 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" /> BDK Policy Descriptor
              </h3>
              <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-amber-500/80 leading-relaxed relative group shadow-inner">
                <div className="break-all whitespace-pre-wrap">{policyDescriptor}</div>
                <button className="absolute bottom-4 right-4 p-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100">
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-3 h-3 text-amber-400" />
                  <p className="text-[10px] text-slate-400">Agentic key authority: 1-of-2 (Limit)</p>
                </div>
                <button
                  disabled={agentOrchestration !== 'live'}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${
                    agentOrchestration === 'live'
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {agentOrchestration === 'live' ? 'Authorize Agent Firewall' : 'Complete Agent Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  FINALIZATION PAGE
  // ═══════════════════════════════════════════════════════════════════════════

  const renderFinalizationPage = () => {
    if (finalizationState.step === 'config') {
      if (finalizationState.type === 'legacy') return renderVaultConfig();
      if (finalizationState.type === 'agentic') return renderAgenticFirewallConfig();
    }

    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <header className="flex items-center gap-4">
          <button
            onClick={() => setFinalizationState({ active: false, step: 'choice', type: null, planId: null })}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Implementation Protocol</h2>
            <p className="text-slate-400 text-sm">Select the operational logic for plan execution.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Option 1: Legacy Bridge */}
          <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <Share2 className="w-6 h-6 text-indigo-500/30 group-hover:text-indigo-400" />
            </div>
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <Users className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The Legacy Bridge</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Multi-signature inheritance vault using Bitcoin miniscript. Links heirs and trustees via Nostr for asynchronous co-signing.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-slate-800 rounded-md"><ShieldCheck className="w-3 h-3 text-slate-300" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Nostr-Native Orchestration</h4>
                    <p className="text-[10px] text-slate-500">NIP-46 remote signing. Trustee never shares private key.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-slate-800 rounded-md"><Smartphone className="w-3 h-3 text-slate-300" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Push-to-Sign Experience</h4>
                    <p className="text-[10px] text-slate-500">Heirs/Lawyers receive notifications for spending requests after timelock expiry.</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFinalizationState((prev) => ({ ...prev, step: 'config', type: 'legacy' }))}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 transition-colors flex items-center justify-center gap-2 group"
            >
              Configure Inheritance Vault <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Option 2: Agentic Firewall */}
          <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <Lock className="w-6 h-6 text-amber-500/30 group-hover:text-amber-400" />
            </div>
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-amber-600/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                <Cpu className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The Agentic Firewall</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Empower AI agents with limited treasury autonomy. Uses OpenClaw as a co-signer with strictly defined spending policy thresholds.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-slate-800 rounded-md"><ShieldCheck className="w-3 h-3 text-slate-300" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Policy-Based Delegation</h4>
                    <p className="text-[10px] text-slate-500">BDK Descriptors define spending limits. Agent signs solo under 50k sats.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-1 bg-slate-800 rounded-md"><Smartphone className="w-3 h-3 text-slate-300" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Escalated Authorization</h4>
                    <p className="text-[10px] text-slate-500">NIP-59 (Gift Wraps) secure PSBT delivery for human approval of large spends.</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFinalizationState((prev) => ({ ...prev, step: 'config', type: 'agentic' }))}
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-4 transition-colors flex items-center justify-center gap-2 group"
            >
              Initialize OpenClaw Firewall <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  OTHER PAGES (unchanged from original)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDashboard = () => (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Advisor Console</h2>
          <p className="text-slate-400">Institutional oversight of B2B2C flow.</p>
        </div>
        <button
          onClick={() => setActiveTab('new_client')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> New Client Plan
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Consultants" value="42" icon={Users} trend="+12%" />
        <StatCard title="Total LTV Generated" value="€126,000" icon={BarChart3} trend="+8%" />
        <StatCard title="AI Intelligence Calls" value="1,284" icon={Cpu} />
        <StatCard title="Compliance Health" value="99.8%" icon={Shield} />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-white font-bold bg-slate-900/50">
          <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" /> Recent Activity</div>
          <button onClick={() => setActiveTab('clients')} className="text-xs text-slate-500 hover:text-white transition-colors">View All</button>
        </div>
        <div className="divide-y divide-slate-800">
          {clients.map((client) => (
            <div key={client.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{client.name}</h4>
                  <p className="text-[10px] text-slate-500">{client.assets} • {client.region}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClientPortfolios = () => (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Client Portfolios</h2>
          <p className="text-slate-400">Manage institutional assets and regulatory standings.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 shadow-inner"
            />
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg border border-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('new_client')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Add Entity
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">Entity Name</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">Jurisdiction</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">Risk Profile</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">Assets Under Advice</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">Custody Logic</th>
                <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredClients.map((client) => {
                const riskInfo = RISK_LEVELS.find((r) => r.id === client.risk);
                return (
                  <tr key={client.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{client.region}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${riskInfo?.color}`} />
                        <span className={`text-xs font-medium ${riskInfo?.text}`}>{riskInfo?.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-300">{client.assets}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{client.type}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-500 hover:text-white p-2 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClientForm = () => (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Structure New Client Plan</h2>
        <p className="text-slate-400 text-sm">Input rigorous metadata for AI Sentinel analysis.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Pseudonym / Entity Name</label>
          <input type="text" placeholder="e.g. Satoshi Trust" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Jurisdiction (MiCA Compliance)</label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all">
            <option>Spain (EU)</option>
            <option>Germany (EU)</option>
            <option>France (EU)</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Asset Context</label>
        <div className="grid grid-cols-3 gap-3">
          <button className="p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl text-left hover:border-indigo-500 transition-all shadow-md">
            <Database className="w-5 h-5 text-indigo-400 mb-2" />
            <p className="text-sm font-bold text-white">Self-Custody</p>
            <p className="text-[10px] text-slate-400">Hardware / Cold</p>
          </button>
          <button className="p-4 border border-slate-800 bg-slate-900/50 rounded-xl text-left hover:border-slate-700 transition-all shadow-md">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-sm font-bold text-white">Lightning Node</p>
            <p className="text-[10px] text-slate-400">L2 Liquidity</p>
          </button>
          <button className="p-4 border border-slate-800 bg-slate-900/50 rounded-xl text-left hover:border-slate-700 transition-all shadow-md">
            <ExternalLink className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-sm font-bold text-white">Exchange</p>
            <p className="text-[10px] text-slate-400">Third-Party Risk</p>
          </button>
        </div>
      </div>
      <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
        <p className="text-xs text-slate-500 max-w-[300px]">
          The AI Swarm will now validate compliance and risk tolerance vectors using the A2A protocol.
        </p>
        <button
          onClick={() => { setIsGenerating(true); setActiveTab('intelligence'); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          Generate Action Plan <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderAgentSwarm = () => (
    <div className="p-8 flex flex-col items-center min-h-[600px] animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Sentinel Swarm</h2>
        <p className="text-slate-400 max-w-lg mx-auto mt-2">Decomposing complex cryptographic intentions into action plans via multi-agent A2A orchestration.</p>
      </div>
      {isGenerating ? (
        <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-2xl p-10 relative shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <DAGNode agent="Manager Agent" title="Workflow Decomposition" description="Splitting tasks via A2A Protocol." status={generationStep >= 1 ? 'completed' : 'processing'} icon={Cpu} />
            <div className="flex gap-12 mt-2 w-full justify-center">
              <DAGNode agent="Market Analyst" title="Liquidity Scanning" description="Mempool density check." status={generationStep >= 2 ? 'completed' : generationStep === 1 ? 'processing' : 'pending'} icon={BarChart3} />
              <DAGNode agent="Compliance Agent" title="MiCA Check" description="Validating non-custodality under Recital 83." status={generationStep >= 2 ? 'completed' : generationStep === 1 ? 'processing' : 'pending'} icon={Shield} />
            </div>
            <div className="mt-8">
              <DAGNode agent="AI Sentinel (Rust)" title="Mathematical Verdict" description="Deterministic verification of miniscript." status={generationStep >= 4 ? 'completed' : generationStep === 3 ? 'processing' : 'pending'} icon={Lock} isLast />
            </div>
          </div>
          {generationStep === 4 && (
            <button
              onClick={() => { setIsGenerating(false); setActiveTab('history'); }}
              className="w-full mt-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
            >
              Review Final Plan (HITL)
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-50">
          <Cpu className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
          <p className="font-medium text-slate-500">Start a new plan to witness agentic orchestration</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  EVENT LOG PANEL (floating)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderEventLog = () => {
    if (!showEventLog) return null;
    return (
      <div className="fixed bottom-0 right-0 w-[500px] max-h-[280px] bg-slate-900 border-t border-l border-slate-800 rounded-tl-xl z-[100] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Nostr Event Stream
          </span>
          <button onClick={() => setShowEventLog(false)} className="text-slate-500 hover:text-white text-xs">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] space-y-0.5">
          {(nostr?.eventLog || []).map((e, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="text-slate-600 shrink-0">{e.time}</span>
              <span className={`shrink-0 ${e.direction === 'IN' ? 'text-emerald-500' : 'text-indigo-400'}`}>
                {e.direction === 'IN' ? '◀' : '▶'}
              </span>
              <span className="text-slate-500 shrink-0">{e.relay}</span>
              <span className="text-slate-400 break-all">{e.raw}</span>
            </div>
          ))}
          {(nostr?.eventLog || []).length === 0 && (
            <p className="text-slate-600">Waiting for Nostr events…</p>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-indigo-500/30">
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-20">
          {finalizationState.active ? (
            renderVaultConfig()
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'clients' && renderClientPortfolios()}
              {activeTab === 'new_client' && renderClientForm()}
              {activeTab === 'intelligence' && renderAgentSwarm()}
              {activeTab === 'history' && (
                <div className="p-8 animate-in fade-in duration-500 space-y-6">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Audit Trail</h2>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-slate-700 shadow-xl transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Institutional Custody Policy #{1024 + i}</h4>
                          <p className="text-[10px] text-slate-500">Sentinel Verified • Oct 24, 2023</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generatePolicyPDF(i)}
                          className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 text-white transition-colors shadow-sm">
                          Download PDF
                        </button>
                        <button
                          onClick={() => setFinalizationState({ active: true, step: 'choice', type: null, planId: i })}
                          className="px-4 py-2 bg-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Sign & Finalize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {renderEventLog()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT — Wraps AppInner in NostrProvider
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <NostrProvider>
      <AppInner />
    </NostrProvider>
  );
}