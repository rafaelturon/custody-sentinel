import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Shield, 
  ChevronRight, 
  Activity, 
  Lock, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Server, 
  Cpu,
  Star,
  Zap,
  LockKeyhole,
  Wifi,
  BarChart,
  Users,
  History,
  ExternalLink,
  Radio,
  Key,
  Clock,
  Code,
  ArrowLeft,
  Database,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Settings,
  X,
  Send,
  Bot,
  User,
  Paperclip,
  MessageSquare
} from 'lucide-react';

// --- MOCK DATA ---
const VAULT_DATA = [
  { name: 'Unchained', type: 'Collaborative', quorum: '2-of-3', target: 'HNW/Businesses', features: ['Financial services integration', 'Open-source tools', 'Dedicated reps'] },
  { name: 'BitGo', type: 'Institutional', quorum: 'Multi-sig / MPC', target: 'Institutions', features: ['Qualified Custodian', '$250M Insurance', 'Regulatory reporting'] },
  { name: 'Self-Hosted', type: 'Sovereign', quorum: 'Custom (Miniscript)', target: 'Technologists', features: ['No counterparty risk', 'Maximum privacy', 'Glacial protocol'] },
];

const BRIEFINGS_DATA = [
  { id: 'b1', title: 'MiCA Compliance Update: Custody Nuances', date: 'Mar 24, 2026', read: false },
  { id: 'b2', title: 'On-chain Fee Market Analysis: Q1 2026', date: 'Mar 17, 2026', read: true },
  { id: 'b3', title: 'Miniscript Vulnerability Disclosure', date: 'Mar 10, 2026', read: true },
];

const CLIENT_PORTFOLIOS_DATA = [
  { id: 1, name: 'Satoshi Nakamoto (Trust)', jurisdiction: 'EU (Spain)', riskScore: 67, lastPlan: '27/03/2026', vault: 'Collaborative' },
  { id: 2, name: 'Estate of Hal Finney', jurisdiction: 'EU (Germany)', riskScore: 88, lastPlan: '14/03/2026', vault: 'Institutional' },
];

const ASSESSMENT_QUESTIONS = [
  { id: 'q1', text: 'Current primary custody method?', options: [{label: 'Exchange/Broker', score: 10}, {label: 'Single-signature Hardware Wallet', score: 40}, {label: 'Basic Multi-signature', score: 70}, {label: 'Institutional Vault / Multi-institution Quorum', score: 100}] },
  { id: 'q2', text: 'Approximate USD value of assets?', options: [{label: 'Under $100k', score: 100}, {label: '$100k - $1M', score: 70}, {label: '$1M - $10M', score: 40}, {label: 'Over $10M', score: 10}] },
  { id: 'q3', text: 'Primary geographic jurisdiction?', options: [{label: 'European Union (EU)', score: 'EU'}, {label: 'United States (US)', score: 'US'}, {label: 'Other / Offshore', score: 'Other'}] },
  { id: 'q4', text: 'Is there a legally binding succession plan?', options: [{label: 'No formal plan', score: 10}, {label: 'Basic instructions left with family', score: 40}, {label: 'Formal legal framework but untested', score: 70}, {label: 'Fully tested, legally bound Miniscript', score: 100}] },
  { id: 'q5', text: 'Security audit in the last 12 months?', options: [{label: 'No', score: 10}, {label: 'Internal review only', score: 50}, {label: 'Yes, full external audit', score: 100}] }
];

export default function App() {
  // --- STATE ---
  const [tier, setTier] = useState('agents'); // agents, pro
  const [credits, setCredits] = useState(100);
  
  // Console State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // Tracks the swarm node progress
  const [reports, setReports] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  // Vault Config State
  const [timelock, setTimelock] = useState('1 Year');

  // New Client Plan State
  const [entityName, setEntityName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Spain (EU)');
  const [selectedVault, setSelectedVault] = useState('Unchained');
  const [planConfigMode, setPlanConfigMode] = useState('new'); // 'new' or 'existing'
  const [answers, setAnswers] = useState({
    q1: ASSESSMENT_QUESTIONS[0].options[0],
    q2: ASSESSMENT_QUESTIONS[1].options[0],
    q3: ASSESSMENT_QUESTIONS[2].options[0],
    q4: ASSESSMENT_QUESTIONS[3].options[0],
    q5: ASSESSMENT_QUESTIONS[4].options[0],
  });

  // Agent Prompt Modal State
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Chat Interface State
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
      role: 'assistant', 
      text: 'Welcome to the Assistant. I am the Sentinel Manager Agent. I have full context of your generated client plans, vault architectures, and regulatory briefings. How can I assist you in structuring or auditing your custody frameworks today?' 
    }
  ]);

  // Selectable Context State
  const [activeContexts, setActiveContexts] = useState({
    satoshiTrust: true,
    halFinney: true,
    selfHosted: true,
    complianceAgent: true,
    arbiterEngine: true,
    micaBriefing: true
  });

  const toggleContext = (key) => {
    setActiveContexts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── PDF Generation ───
  const generatePolicyPDF = (report) => {
    try {
      const doc = new jsPDF();
      const id = report.id.toString().slice(-4);
      const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const pk = 'npub1sentinel8x9u23...'; // Mocked Nostr PK

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
      doc.text(`Custody Governance Blueprint #${id}`, 20, y);

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

      // Safe access to jurisdiction depending on current app state shape
      const currentJurisdiction = typeof jurisdiction !== 'undefined' ? jurisdiction : (answers?.q3?.label || 'Unknown');

      const rows = [
        ['Policy ID', `#${id}`],
        ['Entity Name', entityName || 'Unknown Entity'],
        ['Jurisdiction', currentJurisdiction],
        ['Risk Profile Score', `${report.score}/100`],
        ['Custody Target', selectedVault || 'Self-Hosted'],
        ['Advisor Nostr PK', pk],
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

      let timelockBlocks = '52560';
      if (typeof timelock !== 'undefined') {
        if (timelock === '6 Months') timelockBlocks = '26280';
        if (timelock === '2 Years') timelockBlocks = '105120';
      }

      const vaultLines = [
        `Spending Policy:  2-of-3 Multi-signature (Miniscript)`,
        'Key 1 (Primary):  Client hardware wallet — full control',
        'Key 2 (Heir):     Specified successor — timelocked',
        'Key 3 (Trustee):  Lawyer / recovery signer — async via Nostr (NIP-46)',
        '',
        `Recovery Timelock: ${timelockBlocks} blocks`,
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
      const desc = `wsh(thresh(2,pk([0f0569ed/84'/1'/0']tpub.../0/*),pk([d2f.../0/*),and_v(v:pk(TRUSTEE_PK),after(${timelockBlocks}))))`;
      doc.text(desc, 22, y + 5, { maxWidth: 165 });
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

      // Fallback Strategy to bypass iframe download restrictions
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Try direct download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `custody-policy-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback: Open in new tab (often required inside sandboxed iframes)
      setTimeout(() => {
        window.open(blobUrl, '_blank');
      }, 300);

    } catch (err) {
      console.error("PDF Generation Error: ", err);
    }
  };

  // --- HANDLERS ---
  const handleCreditAction = (cost, actionFn) => {
    if (tier === 'pro') {
      actionFn();
    } else if (credits >= cost) {
      setCredits(prev => prev - cost);
      actionFn();
    } else {
      setShowPaywall(true);
    }
  };

  const handleGeneratePlanClick = () => {
    if (tier === 'agents' && credits < 15) {
      setShowPaywall(true);
      return;
    }
    setPlanConfigMode('existing');
    if (CLIENT_PORTFOLIOS_DATA.length > 0) {
      setEntityName(CLIENT_PORTFOLIOS_DATA[0].name); // Pre-select first client
    }
    setActiveTab('planConfig');
  };

  const unlockReport = (reportId) => {
    handleCreditAction(10, () => {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, unlocked: true } : r));
    });
  };

  const goToSwarm = () => {
    // Calculate final score dynamically based on form selections
    const numericScores = Object.values(answers).map(a => a.score).filter(s => typeof s === 'number');
    const avg = numericScores.length ? Math.round(numericScores.reduce((a, b) => a + b, 0) / numericScores.length) : 50;
    setFinalScore(avg);

    setActiveTab('swarm');
    setCurrentStepIndex(-1);
    setGenerationStep('');
    setIsGenerating(false);
  };

  const handleSwarmTabClick = () => {
    setActiveTab('swarm');
    if (!isGenerating) {
      setCurrentStepIndex(-1);
      setGenerationStep('');
    }
  };

  const startOrchestration = () => {
    setIsGenerating(true);
    setCurrentStepIndex(0); // 0: Manager
    
    const steps = [
      "Manager Agent: Analyzing intent and routing task...",
      "Market Agent: Evaluating macro liquidity constraints...",
      "Compliance Agent: Running deterministic MiCA/AML red-flag checks...",
      "Concierge Agent: Formatting governance framework...",
      "Arbiter (Simulated): Verifying script bounds..."
    ];

    let stepIndex = 0;
    setGenerationStep(steps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setGenerationStep(steps[stepIndex]);
        setCurrentStepIndex(stepIndex);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setCurrentStepIndex(5); // 5: All done
        
        const isEU = answers['q3']?.score === 'EU' || answers['q3']?.label.includes('EU');
        
        const newReport = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          score: finalScore || Math.floor(Math.random() * (90 - 40 + 1)) + 40,
          flags: isEU ? ['MiCA Article 72 Readiness Required', 'Travel Rule AML triggers detected'] : ['Standard AML monitoring advised'],
          recommendation: (finalScore && finalScore < 50) 
            ? "Immediate transition to a collaborative multi-sig (e.g., Unchained 2-of-3) recommended. Current single-point-of-failure risk is severe." 
            : "Maintain current institutional quorum. Recommend implementing quarterly threat simulations to maintain Arbiter Gate 4 sanity checks.",
          unlocked: false
        };
        
        setReports(prev => [newReport, ...prev]);
        
        // Delay switching to reports so user sees the final node turn green
        setTimeout(() => {
          setActiveTab('reports');
        }, 1000);
      }
    }, 1200);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    handleCreditAction(1, () => {
      const newMsg = { role: 'user', text: chatInput };
      setChatMessages(prev => [...prev, newMsg]);
      setChatInput('');
      setIsChatTyping(true);

      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          text: "Analyzing context from Satoshi Trust Blueprint and recent MiCA briefings... Based on current guidelines and your selected Sovereign vault target, maintaining a 2-of-3 multi-sig with one key held by a qualified EU trustee mitigates immediate VASP classification risks while adhering to the established timelock parameters." 
        }]);
        setIsChatTyping(false);
      }, 1800);
    });
  };

  // --- NODE UI HELPERS ---
  const getNodeStatus = (nodeName) => {
    if (currentStepIndex === -1) return 'idle';
    
    switch(nodeName) {
      case 'manager':
        // Manager blinks on step 0 and 3 (Concierge outputting)
        if (currentStepIndex === 0 || currentStepIndex === 3) return 'processing';
        if (currentStepIndex > 0 && currentStepIndex !== 3) return 'completed';
        return 'idle';
      case 'market':
        if (currentStepIndex === 1) return 'processing';
        if (currentStepIndex > 1) return 'completed';
        return 'idle';
      case 'compliance':
        if (currentStepIndex === 2) return 'processing';
        if (currentStepIndex > 2) return 'completed';
        return 'idle';
      case 'arbiter':
        if (currentStepIndex === 4) return 'processing';
        if (currentStepIndex > 4) return 'completed';
        return 'idle';
      default:
        return 'idle';
    }
  };

  const getNodeClasses = (status, defaultBorder = "border border-slate-700/80", defaultBg = "bg-slate-900/80", defaultText = "text-slate-400", extra = "p-4") => {
    let base = `w-full max-w-xs ${extra} rounded-xl transition-all duration-500 shadow-lg backdrop-blur-sm relative `;
    
    if (status === 'completed') {
      return base + "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
    } else if (status === 'processing') {
      return base + "border-2 border-slate-400 bg-slate-800 text-slate-200 shadow-[0_0_20px_rgba(148,163,184,0.3)]";
    } else {
      return base + `${defaultBorder} ${defaultBg} ${defaultText}`;
    }
  };

  const getCheckIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-3 h-3 text-emerald-500" />;
    if (status === 'processing') return <CheckCircle className="w-3 h-3 text-slate-400 animate-pulse" />;
    return <CheckCircle className="w-3 h-3 text-slate-700" />;
  };

  const getPromptText = (node) => {
    const jurisdictionStr = answers['q3']?.label || 'Unknown';
    switch(node) {
      case 'manager': return `SYSTEM: You are the Sentinel Manager Agent.\n\nOBJECTIVE: Analyze client intake metadata.\nEntity: ${entityName || 'Unknown'}\nJurisdiction: ${jurisdictionStr}\n\nTASK: Decompose the governance planning task. Route compliance checks to the Compliance Agent and liquidity constraints to the Market Agent via A2A protocol.`;
      case 'market': return `SYSTEM: You are the Market Analyst Agent.\n\nOBJECTIVE: Evaluate current mempool density and on-chain fee environments.\n\nTASK: Recommend optimal UTXO consolidation strategies and quorum threshold timings for a multi-signature vault operating under current network conditions.`;
      case 'compliance': return `SYSTEM: You are the Compliance Agent.\n\nOBJECTIVE: Cross-reference regulatory frameworks for ${jurisdictionStr}.\n\nTASK: Ensure the proposed custody architecture does not trigger unintended VASP (Virtual Asset Service Provider) classification under MiCA or Travel Rule mandates. Advise on non-custodial software bounds.`;
      case 'arbiter': return `SYSTEM: You are the Arbiter Proof Engine (Rust).\n\nOBJECTIVE: Deterministically verify the output Miniscript policy.\n\nTASK: Compile the proposed policy tree. Check for satisfiability, timelock conflicts, and prevent unspendable output paths. Reject any policy that fails mathematical verification.`;
      case 'briefing': return `SYSTEM: You are the Intelligence Briefing Agent.\n\nOBJECTIVE: Monitor global regulatory, market, and protocol developments.\n\nTASK: Generate a concise, high-signal weekly intelligence briefing tailored for institutional digital asset custodians. Highlight MiCA updates, mempool dynamics, and any major vulnerability disclosures affecting Miniscript or multisig quorum setups.`;
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 h-screen sticky top-0 flex flex-col p-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">SENTINEL</h1>
            <p className="text-[10px] text-slate-500 font-mono">AGENTS {tier === 'pro' && '(PRO)'}</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <MessageSquare className="w-4 h-4" /> Assistant
          </button>
          <button onClick={() => setActiveTab('portfolios')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${(activeTab === 'portfolios' || activeTab === 'reports' || activeTab === 'planConfig') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Users className="w-4 h-4" /> Plans
          </button>
          <button onClick={handleSwarmTabClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'swarm' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Cpu className="w-4 h-4" /> Swarm & Arbiter
          </button>
          <button onClick={() => setActiveTab('vaults')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'vaults' || activeTab === 'vaultConfig' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Server className="w-4 h-4" /> Vaults
          </button>
          <button onClick={() => setActiveTab('briefings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'briefings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <FileText className="w-4 h-4" /> Briefings
          </button>
        </nav>

        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">CA</div>
            <div>
              <p className="text-xs font-bold text-white">Sentinel {tier === 'pro' ? 'Pro' : 'Agents'}</p>
              <p className="text-[10px] text-emerald-400">{tier === 'pro' ? 'Subscription Active' : `${credits} Credits Remaining`}</p>
            </div>
          </div>
          {tier === 'agents' && (
             <button onClick={() => setShowPaywall(true)} className="w-full text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-colors bg-slate-800 py-2 rounded mt-2">Upgrade (€79/mo)</button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col h-screen">
        
        {/* DASHBOARD TAB - LLM CHAT INTERFACE */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex gap-6 p-6 overflow-hidden h-full max-w-7xl mx-auto w-full animate-in fade-in">
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" /> Assistant
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Querying across all generated portfolios and configurations</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-emerald-500 font-mono">Swarm Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500 ml-3' : 'bg-slate-800 border border-slate-700 mr-3'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {isChatTyping && (
                  <div className="flex justify-start">
                    <div className="flex flex-row max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mr-3">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/50 border border-slate-700/50 flex gap-1 items-center h-[52px]">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-950 border-t border-slate-800">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <button type="button" className="absolute left-4 text-slate-500 hover:text-indigo-400 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask about MiCA regulations, check Hal Finney's timelock... ${tier !== 'pro' ? '(1 Credit)' : ''}`} 
                    className="w-full bg-[#0B0F19] border border-slate-700 focus:border-indigo-500 rounded-xl py-4 pl-12 pr-14 text-sm text-white focus:outline-none transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isChatTyping}
                    className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-1 group"
                  >
                    {tier !== 'pro' && <Zap className="w-3 h-3 text-indigo-300 opacity-70 group-hover:opacity-100" />}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Context Sidebar */}
            <div className="w-80 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl hidden lg:flex">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80">
                <h3 className="font-bold text-white text-sm flex items-center">
                  <Database className="w-4 h-4 mr-2 text-emerald-400" /> Active Knowledge Context
                </h3>
              </div>
              <div className="p-4 overflow-y-auto space-y-6 flex-1">
                
                {/* Context: Plans */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Client Plans</h4>
                  <div className="space-y-2">
                    <div 
                      onClick={() => toggleContext('satoshiTrust')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.satoshiTrust ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className={`w-4 h-4 ${activeContexts.satoshiTrust ? 'text-indigo-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`text-xs font-bold ${activeContexts.satoshiTrust ? 'text-slate-300' : 'text-slate-500'}`}>Satoshi Trust Blueprint</p>
                          <p className="text-[10px] text-slate-500">EU (Spain) • Score: 67</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.satoshiTrust ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.satoshiTrust ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    <div 
                      onClick={() => toggleContext('halFinney')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.halFinney ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className={`w-4 h-4 ${activeContexts.halFinney ? 'text-indigo-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`text-xs font-bold ${activeContexts.halFinney ? 'text-slate-300' : 'text-slate-500'}`}>Hal Finney Estate</p>
                          <p className="text-[10px] text-slate-500">EU (Germany) • Score: 88</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.halFinney ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.halFinney ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context: Vaults */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Vault Architectures</h4>
                  <div className="space-y-2">
                    <div 
                      onClick={() => toggleContext('selfHosted')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.selfHosted ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className={`w-4 h-4 ${activeContexts.selfHosted ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`text-xs font-bold ${activeContexts.selfHosted ? 'text-slate-300' : 'text-slate-500'}`}>Self-Hosted Sovereign</p>
                          <p className="text-[10px] font-mono text-slate-500">wsh(thresh(2,...))</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.selfHosted ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.selfHosted ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context: Swarm Configs */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Swarm Configurations</h4>
                  <div className="space-y-2">
                    <div 
                      onClick={() => toggleContext('complianceAgent')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.complianceAgent ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className={`w-4 h-4 ${activeContexts.complianceAgent ? 'text-slate-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`text-xs font-bold ${activeContexts.complianceAgent ? 'text-slate-300' : 'text-slate-500'}`}>Compliance Agent Prompts</p>
                          <p className="text-[10px] text-slate-500">MiCA & Travel Rule Rulesets</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.complianceAgent ? 'bg-slate-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.complianceAgent ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    <div 
                      onClick={() => toggleContext('arbiterEngine')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.arbiterEngine ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Code className={`w-4 h-4 ${activeContexts.arbiterEngine ? 'text-amber-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`text-xs font-bold ${activeContexts.arbiterEngine ? 'text-slate-300' : 'text-slate-500'}`}>Arbiter Proof Engine</p>
                          <p className="text-[10px] text-slate-500">Miniscript Validations</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.arbiterEngine ? 'bg-amber-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.arbiterEngine ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context: Briefings */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Recent Briefings</h4>
                  <div className="space-y-2">
                    <div 
                      onClick={() => toggleContext('micaBriefing')}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${activeContexts.micaBriefing ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-900/40 border-slate-800/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-4 h-4 ${activeContexts.micaBriefing ? 'text-slate-400' : 'text-slate-600'}`} />
                        <p className={`text-xs font-bold truncate ${activeContexts.micaBriefing ? 'text-slate-300' : 'text-slate-500'}`}>MiCA Custody Nuances</p>
                      </div>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${activeContexts.micaBriefing ? 'bg-slate-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${activeContexts.micaBriefing ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        <div className={`overflow-y-auto w-full h-full pb-20 p-6 md:p-10 ${activeTab === 'dashboard' ? 'hidden' : 'block'}`}>

          {/* PLAN CONFIGURATION TAB */}
          {activeTab === 'planConfig' && (
            <div className="max-w-4xl mx-auto animate-in fade-in py-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Structure {planConfigMode === 'new' ? 'New' : 'Existing'} Client Plan</h2>
              <p className="text-slate-400 mt-2 text-sm">Input rigorous metadata for AI Sentinel analysis.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 block">Pseudonym / Entity Name</label>
                  {planConfigMode === 'new' ? (
                    <input 
                      type="text" 
                      placeholder="e.g. Satoshi Trust" 
                      value={entityName} 
                      onChange={e => setEntityName(e.target.value)} 
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  ) : (
                    <select 
                      value={entityName} 
                      onChange={e => setEntityName(e.target.value)} 
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {CLIENT_PORTFOLIOS_DATA.map(client => (
                        <option key={client.id} value={client.name}>{client.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                {ASSESSMENT_QUESTIONS.map(q => (
                  <div key={q.id}>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 block truncate">{q.text}</label>
                    <select 
                      value={answers[q.id]?.label || ''} 
                      onChange={e => {
                        const selectedOpt = q.options.find(o => o.label === e.target.value);
                        setAnswers(prev => ({ ...prev, [q.id]: selectedOpt }));
                      }} 
                      className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 block">Vault Infrastructure Target</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setSelectedVault('Unchained')} 
                    className={`cursor-pointer p-6 rounded-2xl border transition-all ${selectedVault === 'Unchained' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'}`}
                  >
                    <Database className={`w-6 h-6 mb-4 transition-colors ${selectedVault === 'Unchained' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <h4 className="font-bold text-white text-lg">Unchained</h4>
                    <p className="text-xs text-slate-400 mt-1">Collaborative</p>
                  </div>
                  <div 
                    onClick={() => setSelectedVault('BitGo')} 
                    className={`cursor-pointer p-6 rounded-2xl border transition-all ${selectedVault === 'BitGo' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'}`}
                  >
                    <Zap className={`w-6 h-6 mb-4 transition-colors ${selectedVault === 'BitGo' ? 'text-amber-400' : 'text-slate-400'}`} />
                    <h4 className="font-bold text-white text-lg">BitGo</h4>
                    <p className="text-xs text-slate-400 mt-1">Institutional</p>
                  </div>
                  <div 
                    onClick={() => {
                      if (selectedVault !== 'Self-Hosted') {
                        handleCreditAction(5, () => setSelectedVault('Self-Hosted'));
                      }
                    }} 
                    className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden group ${
                      selectedVault === 'Self-Hosted' 
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'
                    }`}
                  >
                    {tier !== 'pro' && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest text-indigo-400 border border-indigo-500/50 z-10">
                        <Zap className="w-3 h-3" /> 5 Credits
                      </div>
                    )}
                    <ExternalLink className={`w-6 h-6 mb-4 transition-colors ${selectedVault === 'Self-Hosted' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <h4 className="font-bold text-white text-lg">Self-Hosted</h4>
                    <p className="text-xs text-slate-500 mt-1">Sovereign</p>
                    
                    {tier !== 'pro' && selectedVault !== 'Self-Hosted' && (
                      <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <span className="text-xs font-bold text-white flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-indigo-400" /> Use 5 Credits
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-14 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-8 gap-6">
                <p className="text-sm text-slate-500 max-w-sm">
                  The AI Swarm will now validate compliance and risk tolerance vectors using the A2A protocol.
                </p>
                <button 
                  onClick={goToSwarm} 
                  className="w-full sm:w-auto px-8 py-4 bg-[#6366f1] hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center text-lg tracking-wide"
                >
                  Generate Action Plan <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* CLIENT PORTFOLIOS TAB */}
          {activeTab === 'portfolios' && (
            <div className="max-w-6xl mx-auto animate-in fade-in">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                 <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Plans</h2>
                   <p className="text-slate-400 mt-2 text-sm">Manage institutional assets and regulatory standings.</p>
                 </div>
                 <div className="flex items-center gap-4 mt-6 md:mt-0">
                   <div className="relative">
                     <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input type="text" placeholder="Filter clients..." className="bg-slate-900/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 w-full md:w-64" />
                   </div>
                   <button className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                     <Filter className="w-4 h-4" />
                   </button>
                   <button onClick={() => { setPlanConfigMode('new'); setEntityName(''); setActiveTab('planConfig'); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                     <Plus className="w-4 h-4" /> Add Entity
                   </button>
                 </div>
               </div>

               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-extrabold text-white tracking-tight">Governance State</h2>
                 {finalScore !== null && (
                   <div className="flex items-center space-x-4 bg-slate-900 px-6 py-3 rounded-xl border border-slate-800">
                     <span className="text-sm text-slate-400 font-medium">Readiness Score</span>
                     <span className={`text-2xl font-bold ${finalScore > 70 ? 'text-emerald-500' : finalScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                       {finalScore}/100
                     </span>
                   </div>
                 )}
               </div>

               <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-950/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                         <th className="p-5 pl-6">Entity Name</th>
                         <th className="p-5">Jurisdiction</th>
                         <th className="p-5">Risk Score</th>
                         <th className="p-5">Last Plan</th>
                         <th className="p-5">Vault Architecture</th>
                         <th className="p-5 text-right pr-6">Plans</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                       {CLIENT_PORTFOLIOS_DATA.map((client) => (
                         <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => setActiveTab('reports')}>
                           <td className="p-5 pl-6 flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700/50">
                               <Users className="w-5 h-5 text-slate-400" />
                             </div>
                             <span className="font-bold text-white text-sm">{client.name}</span>
                           </td>
                           <td className="p-5 text-sm text-slate-400">{client.jurisdiction}</td>
                           <td className="p-5 text-sm font-bold">
                             <span className={client.riskScore > 70 ? 'text-emerald-500' : 'text-amber-500'}>{client.riskScore}/100</span>
                           </td>
                           <td className="p-5 text-sm text-indigo-400">{client.lastPlan}</td>
                           <td className="p-5 text-sm text-slate-400">{client.vault}</td>
                           <td className="p-5 text-right pr-6">
                             <ChevronRight className="w-4 h-4 text-slate-600 inline-block group-hover:text-white transition-colors" />
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}

          {/* REPORTS DETAILS TAB */}
          {activeTab === 'reports' && (
            <div className="max-w-5xl mx-auto animate-in fade-in">
               <div className="flex items-center mb-8">
                 <button onClick={() => setActiveTab('portfolios')} className="mr-4 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                   <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Client Plans</h2>
                   <p className="text-slate-400 mt-1 text-sm">Governance blueprints for the selected entity.</p>
                 </div>
               </div>

               <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-xl mb-8">
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                     <h3 className="text-xl text-white font-bold mb-2 flex items-center">
                       <Cpu className="w-5 h-5 mr-2 text-indigo-400" /> Deploy AI Orchestrator
                     </h3>
                     <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                       Deploy Manager and Concierge agents to synthesize your assessment data, market conditions, and regulatory constraints into an actionable Miniscript framework.
                     </p>
                   </div>
                   <button 
                     onClick={handleGeneratePlanClick}
                     disabled={isGenerating}
                     className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center ${isGenerating ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                   >
                     {isGenerating ? (
                       <><Activity className="w-5 h-5 mr-2 animate-spin" /> Orchestrating...</>
                     ) : (
                       <><Zap className="w-5 h-5 mr-2" /> Generate Plan</>
                     )}
                   </button>
                 </div>
               </div>
               
               {reports.length === 0 ? (
                 <div className="text-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
                   <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                   <p className="text-slate-400">No reports generated yet. Head to the Advisor Console to deploy the Swarm.</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {reports.map(report => (
                     <div key={report.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden relative shadow-xl">
                       {tier === 'agents' && !report.unlocked && (
                         <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
                           <p className="text-8xl font-black text-white transform -rotate-12 whitespace-nowrap">PREVIEW</p>
                         </div>
                       )}
                       
                       <div className="p-6 border-b border-slate-800 relative z-10 flex justify-between items-center bg-slate-950/50">
                          <div>
                            <h3 className="text-lg font-bold text-white">Custody Governance Blueprint</h3>
                            <p className="text-sm text-slate-500">{report.date} • Concierge Agent Output</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-bold">Risk Score</p>
                            <span className={`text-xl font-bold ${report.score > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{report.score}/100</span>
                          </div>
                       </div>
                       <div className="p-6 relative z-10 space-y-6">
                         <div>
                           <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Recommendation</h4>
                           <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/50 text-sm">
                             {report.recommendation}
                           </p>
                         </div>
                         
                         <div>
                           <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold flex items-center">
                             <Shield className="w-4 h-4 mr-2" /> Compliance Output
                           </h4>
                           <ul className="space-y-2">
                             {report.flags.map((flag, idx) => (
                               <li key={idx} className="flex items-start text-sm bg-red-900/10 border border-red-900/30 p-3 rounded-lg">
                                 <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                 <span className="text-slate-300">{flag}</span>
                               </li>
                             ))}
                             <li className="flex items-start text-sm bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-lg">
                               <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                               <span className="text-slate-300">Phase 0 Schema validation passed via Pydantic Pipeline.</span>
                             </li>
                           </ul>
                         </div>

                         {tier === 'agents' && !report.unlocked ? (
                           <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                             <p className="text-sm text-amber-500/80 italic">Watermark present. Use 10 credits or upgrade to Pro for clean PDF exports.</p>
                             <button onClick={() => unlockReport(report.id)} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                               Unlock Clean Report
                               <span className="ml-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest flex items-center"><Zap className="w-3 h-3 mr-1"/> 10 Credits</span>
                             </button>
                           </div>
                         ) : (
                           <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                             <p className="text-sm text-emerald-500/80 italic">{tier === 'pro' ? 'Pro license active.' : 'Report unlocked.'} Ready for export.</p>
                             <button onClick={() => generatePolicyPDF(report)} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                               Download PDF Report
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {/* SWARM & ARBITER TAB */}
          {activeTab === 'swarm' && (
            <div className="max-w-6xl mx-auto w-full flex flex-col items-center min-h-[600px] animate-in fade-in duration-700">
              <div className="w-full flex flex-col md:flex-row md:items-start justify-between mb-12">
                <div className="mb-6 md:mb-0">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Swarm & Arbiter</h2>
                  <p className="text-slate-400 mt-2 text-sm max-w-xl">
                    The Swarm (cognitive, probabilistic) and Arbiter Proof Engine (deterministic, mathematical). The Swarm generates custody governance plans. Arbiter attempts to disprove them. Plans that survive Arbiter validation are mathematically executable on the Bitcoin network.
                  </p>
                </div>
                
                <div className="flex flex-col md:items-end">
                  {!isGenerating && (
                    <button 
                      onClick={() => handleCreditAction(15, startOrchestration)} 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                        tier === 'pro' 
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <Zap className="w-4 h-4" /> Start Orchestration
                      {tier !== 'pro' && <span className="ml-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest flex items-center"><Zap className="w-3 h-3 mr-1"/> 15 Credits</span>}
                    </button>
                  )}

                  {isGenerating && (
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-sm text-emerald-400 flex items-center shadow-xl">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2.5"></span>
                      {generationStep}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                {/* Column 1: Swarm Graph */}
                <div className="lg:col-span-2 w-full flex justify-center">
                  <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-2xl p-10 relative shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      
                      {/* Top Node (Manager Agent) */}
                      <div className="relative flex flex-col items-center">
                        {(() => {
                          const status = getNodeStatus('manager');
                          return (
                            <div className={getNodeClasses(status, "border-2 border-slate-700/50", "bg-slate-900/40", "text-slate-400")}>
                              <button onClick={() => setSelectedPrompt('manager')} className="absolute top-3 right-3 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors z-20">
                                <Settings className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-3 mb-2 pr-6">
                                <Cpu className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-widest uppercase">Manager Agent</span>
                              </div>
                              <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-emerald-400' : 'text-white'}`}>Workflow Decomposition</h4>
                              <p className="text-[10px] mt-1 text-slate-500 leading-tight">Splitting tasks via A2A Protocol.</p>
                              <div className="mt-3 flex justify-between items-center">
                                <span className="text-[10px] font-mono opacity-60">ID: fhmuk</span>
                                {getCheckIcon(status)}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="h-8 w-px bg-slate-700 my-2 relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-t-4 border-x-4 border-x-transparent border-t-slate-700"></div>
                        </div>
                      </div>
                      
                      {/* Middle Nodes */}
                      <div className="flex gap-12 mt-2 w-full justify-center">
                        
                        {/* Market Analyst Node */}
                        <div className="relative flex flex-col items-center">
                          {(() => {
                            const status = getNodeStatus('market');
                            return (
                              <div className={getNodeClasses(status, "border border-slate-700/80", "bg-slate-900/80", "text-slate-400")}>
                                <button onClick={() => setSelectedPrompt('market')} className="absolute top-3 right-3 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors z-20">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3 mb-2 pr-6">
                                  <BarChart className="w-4 h-4" />
                                  <span className={`text-xs font-bold tracking-widest uppercase ${status === 'idle' ? 'text-slate-300' : ''}`}>Market Analyst</span>
                                </div>
                                <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-emerald-400' : 'text-white'}`}>Liquidity Scanning</h4>
                                <p className="text-[10px] mt-1 text-slate-500 leading-tight">Mempool density check.</p>
                                <div className="mt-3 flex justify-between items-center">
                                  <span className="text-[10px] font-mono opacity-60">ID: c9yho</span>
                                  {getCheckIcon(status)}
                                </div>
                              </div>
                            );
                          })()}
                          <div className="h-8 w-px bg-slate-700 my-2 relative">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-t-4 border-x-4 border-x-transparent border-t-slate-700"></div>
                          </div>
                        </div>
                        
                        {/* Compliance Node */}
                        <div className="relative flex flex-col items-center">
                          {(() => {
                            const status = getNodeStatus('compliance');
                            return (
                              <div className={getNodeClasses(status, "border border-slate-700/80", "bg-slate-900/80", "text-slate-400")}>
                                <button onClick={() => setSelectedPrompt('compliance')} className="absolute top-3 right-3 p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors z-20">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3 mb-2 pr-6">
                                  <Shield className="w-4 h-4" />
                                  <span className={`text-xs font-bold tracking-widest uppercase ${status === 'idle' ? 'text-slate-300' : ''}`}>Compliance</span>
                                </div>
                                <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-emerald-400' : 'text-white'}`}>MiCA Check</h4>
                                <p className="text-[10px] mt-1 text-slate-500 leading-tight">Validating non-custodality.</p>
                                <div className="mt-3 flex justify-between items-center">
                                  <span className="text-[10px] font-mono opacity-60">ID: 7mcxa</span>
                                  {getCheckIcon(status)}
                                </div>
                              </div>
                            );
                          })()}
                          <div className="h-8 w-px bg-slate-700 my-2 relative">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-t-4 border-x-4 border-x-transparent border-t-slate-700"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Node (Arbiter) */}
                      <div className="mt-6">
                        <div className="relative flex flex-col items-center">
                          {tier === 'pro' ? (() => {
                            const status = getNodeStatus('arbiter');
                            return (
                              <div className={getNodeClasses(status, "border-2 border-indigo-500/40", "bg-indigo-500/5", "text-indigo-400", "p-5")}>
                                <button onClick={() => setSelectedPrompt('arbiter')} className="absolute top-3 right-3 p-1.5 bg-indigo-900/40 hover:bg-indigo-800/60 rounded-md text-indigo-300 hover:text-white transition-colors z-20">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3 mb-2 pr-6">
                                  <Lock className="w-4 h-4" />
                                  <span className="text-xs font-bold tracking-widest uppercase">Arbiter (Rust)</span>
                                </div>
                                <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-emerald-400' : 'text-white'}`}>Proof Engine</h4>
                                <p className="text-[10px] mt-1 text-slate-500 leading-tight">Deterministic verification of miniscript bounds.</p>
                                <div className="mt-3 flex justify-between items-center">
                                  <span className="text-[10px] font-mono opacity-60">ID: iw4a8</span>
                                  {getCheckIcon(status)}
                                </div>
                              </div>
                            );
                          })() : (
                            <div 
                              onClick={() => setShowPaywall(true)}
                              className="w-full max-w-xs p-5 rounded-xl border-2 border-slate-800 text-slate-500 bg-slate-900/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group cursor-pointer hover:border-emerald-500/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Lock className="w-4 h-4" />
                                  <span className="text-xs font-bold tracking-widest uppercase">Arbiter (Rust)</span>
                                </div>
                                <span className="text-[9px] font-mono uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Pro Only</span>
                              </div>
                              <h4 className="font-bold text-slate-400 text-sm">Proof Engine</h4>
                              <p className="text-[10px] mt-1 text-slate-500 leading-tight">Deterministic verification of miniscript bounds.</p>
                              <div className="mt-3 flex justify-between items-center opacity-50">
                                <span className="text-[10px] font-mono">ID: LOCKED</span>
                                <LockKeyhole className="w-3 h-3 text-slate-500" />
                              </div>
                              
                              {/* Hover Upgrade Overlay */}
                              <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xs font-bold text-white flex items-center">
                                  <Zap className="w-4 h-4 mr-2 text-emerald-500" /> Upgrade to Unlock
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* Column 2: Context Modules */}
                <div className="lg:col-span-1 flex flex-col space-y-6">
                  {/* Compliance Agent Light */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
                    <h4 className="text-white font-bold mb-4 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-amber-500"/> Compliance Agent (Light)</h4>
                    {(answers['q3']?.score === 'EU' || answers['q3']?.label.includes('EU')) ? (
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200">
                          <strong>Flag:</strong> MiCA Regulation (EU) applies to your operating jurisdiction.
                        </div>
                        <div className="p-3 bg-amber-900/20 border border-amber-900/50 rounded-lg text-amber-200">
                          <strong>Warning:</strong> Ensure self-hosted setups comply with the impending Transfer of Funds Regulation (Travel Rule).
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 bg-slate-800/30 p-4 rounded-lg border border-slate-800">
                        No immediate high-risk regulatory flags detected for your jurisdiction ({answers['q3']?.label || 'Unknown'}). Continuous monitoring active.
                      </p>
                    )}
                  </div>

                  {/* Arbiter Deterministic Engine Light */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
                    <h4 className="text-white font-bold mb-4 flex items-center"><LockKeyhole className="w-4 h-4 mr-2 text-indigo-400"/> Arbiter Engine</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-3">
                        <span className="text-slate-400">Gate 1: Derivation Path</span>
                        {tier === 'pro' ? <span className="text-emerald-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Ready</span> : <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Pro feature</span>}
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-3">
                        <span className="text-slate-400">Gate 2: Script Typology</span>
                        {tier === 'pro' ? <span className="text-emerald-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Ready</span> : <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Pro feature</span>}
                      </div>
                      <div className="flex justify-between items-center text-sm pb-1">
                        <span className="text-slate-400">Gates 3-4 (Satisfiability)</span>
                        <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Principal Tier</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VAULTS / AUDIT TAB */}
          {activeTab === 'vaults' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                 <div>
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Vault Comparison Engine</h2>
                   <p className="text-slate-400 mt-2 text-sm">Review supported custody architectures.</p>
                 </div>
                 <div className="mt-6 md:mt-0">
                   <button
                     onClick={() => handleCreditAction(10, () => setActiveTab('vaultConfig'))}
                     className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                       tier === 'pro' 
                         ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                         : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                     }`}
                   >
                     <Settings className="w-4 h-4" /> Configure Vaults
                     {tier !== 'pro' && <span className="ml-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest flex items-center"><Zap className="w-3 h-3 mr-1"/> 10 Credits</span>}
                   </button>
                 </div>
               </div>
               
               <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
                 <table className="w-full text-left border-collapse bg-slate-900/40">
                   <thead>
                     <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-800">
                       <th className="p-5 font-bold">Provider</th>
                       <th className="p-5 font-bold">Architecture</th>
                       <th className="p-5 font-bold">Quorum</th>
                       <th className="p-5 font-bold">Target Entity</th>
                       <th className="p-5 font-bold">Key Features</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {VAULT_DATA.map((vault, i) => (
                       <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                         <td className="p-5 font-bold text-white">{vault.name}</td>
                         <td className="p-5"><span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">{vault.type}</span></td>
                         <td className="p-5 text-sm font-mono text-slate-400">{vault.quorum}</td>
                         <td className="p-5 text-sm text-slate-400">{vault.target}</td>
                         <td className="p-5 text-sm text-slate-400">
                           <ul className="space-y-1">
                             {vault.features.map((f, j) => <li key={j} className="flex items-center"><ChevronRight className="w-3 h-3 text-slate-600 mr-1"/> {f}</li>)}
                           </ul>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {tier === 'agents' && (
                 <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl text-indigo-200 text-sm flex items-center font-medium">
                   <Star className="w-4 h-4 mr-2" /> Upgrade to Sentinel Pro to unlock personalized AI vault recommendations based on your assessment data.
                 </div>
               )}
            </div>
          )}

          {/* VAULT CONFIGURATION TAB (Sovereign Builder) */}
          {activeTab === 'vaultConfig' && (
            <div className="max-w-6xl mx-auto animate-in fade-in">
              <div className="flex items-center mb-8">
                <button onClick={() => setActiveTab('vaults')} className="mr-4 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Vault Configuration</h2>
                  <p className="text-slate-400 mt-1 text-sm">Define spending paths and timelocks for inheritance logic.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Mapping & Timelock) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Participant Mapping */}
                  <div className="bg-[#111827] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center mb-6">
                      <Users className="w-4 h-4 mr-2 text-indigo-400" /> Participant Mapping
                    </h3>
                    <div className="space-y-4">
                      {/* Key 1 */}
                      <div className="flex items-center justify-between p-4 bg-[#0B0F19] border border-slate-800/80 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center mr-4 border border-slate-700/50">
                            <Key className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Primary Key</h4>
                            <p className="text-xs text-slate-500">Consultant / Client Main Hardware</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-slate-800/80 text-slate-400 text-[10px] font-mono rounded border border-slate-700/50">Full Control</span>
                      </div>
                      
                      {/* Key 2 */}
                      <div className="flex items-center justify-between p-4 bg-[#0B0F19] border border-slate-800/80 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center mr-4 border border-slate-700/50">
                            <Key className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Heir Key</h4>
                            <p className="text-xs text-slate-500">Specified Successor Wallet</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-slate-800/80 text-slate-400 text-[10px] font-mono rounded border border-slate-700/50">LTV Locked</span>
                      </div>
                      
                      {/* Key 3 */}
                      <div className="flex items-center justify-between p-4 bg-[#0B0F19] border border-slate-800/80 rounded-xl">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center mr-4 border border-slate-700/50">
                            <Key className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Trustee / Lawyer</h4>
                            <p className="text-xs text-slate-500">Asynchronous Recovery Signer via Nostr</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recovery Path Timelock */}
                  <div className="bg-[#111827] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center mb-6">
                      <Clock className="w-4 h-4 mr-2 text-amber-400" /> Recovery Path Timelock
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button onClick={() => setTimelock('6 Months')} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${timelock === '6 Months' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'}`}>
                        <span className={`font-bold text-sm ${timelock === '6 Months' ? 'text-amber-500' : 'text-slate-300'}`}>6 Months</span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1">26280 Blocks</span>
                      </button>
                      <button onClick={() => setTimelock('1 Year')} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${timelock === '1 Year' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'}`}>
                        <span className={`font-bold text-sm ${timelock === '1 Year' ? 'text-amber-500' : 'text-slate-300'}`}>1 Year</span>
                        <span className={`text-[10px] font-mono mt-1 ${timelock === '1 Year' ? 'text-amber-500/80' : 'text-slate-500'}`}>52560 Blocks</span>
                      </button>
                      <button onClick={() => setTimelock('2 Years')} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${timelock === '2 Years' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800/80 bg-[#0B0F19] hover:border-slate-700'}`}>
                        <span className={`font-bold text-sm ${timelock === '2 Years' ? 'text-amber-500' : 'text-slate-300'}`}>2 Years</span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1">105120 Blocks</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Column (Output Descriptor) */}
                <div className="bg-[#111827] border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center mb-6">
                    <Code className="w-4 h-4 mr-2 text-emerald-400" /> Output Descriptor
                  </h3>
                  <div className="flex-1 bg-[#0B0F19] border border-slate-800/80 rounded-xl p-6 relative overflow-hidden flex items-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                      <Code className="w-64 h-64 text-emerald-500" />
                    </div>
                    <p className="font-mono text-sm leading-loose text-emerald-400/90 break-all relative z-10">
                      wsh(thresh(2,pk([0f0569ed/84'/1'/0']tpub.../0/*),pk([d2f.../0/*),and_v(v:pk(TRUSTEE_XPUB_PENDING),after({timelock === '6 Months' ? '26280' : timelock === '1 Year' ? '52560' : '105120'}))))
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* BRIEFINGS TAB */}
          {activeTab === 'briefings' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Weekly Intelligence Briefings</h2>
                  <p className="text-slate-400 mt-2 text-sm">Curated market and regulatory updates.</p>
                </div>
                <div className="mt-6 md:mt-0">
                  <button
                    onClick={() => handleCreditAction(5, () => setSelectedPrompt('briefing'))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                      tier === 'pro' 
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <Settings className="w-4 h-4" /> Configure Briefing
                    {tier !== 'pro' && <span className="ml-1 bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest flex items-center"><Zap className="w-3 h-3 mr-1"/> 5 Credits</span>}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {BRIEFINGS_DATA.map((briefing) => (
                  <div key={briefing.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-lg transition-all hover:bg-slate-800/30 cursor-pointer group">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 border ${!briefing.read ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-800/60 border-slate-700/50 text-slate-400'}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${!briefing.read ? 'text-white' : 'text-slate-300'}`}>{briefing.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Sentinel AI Research • {briefing.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center sm:ml-4 shrink-0">
                      {!briefing.read && <span className="mr-4 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded">New</span>}
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              {tier === 'agents' && (
                <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl text-indigo-200 text-sm flex items-center font-medium">
                  <Star className="w-4 h-4 mr-2" /> Upgrade to Sentinel Pro to unlock personalized intelligence briefings based on your portfolio data.
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* PROMPT MODAL */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
               <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center">
                 <Code className="w-4 h-4 mr-2 text-indigo-400"/> System Prompt Configuration
               </h3>
               <button onClick={() => setSelectedPrompt(null)} className="text-slate-500 hover:text-white transition-colors">
                 <X className="w-5 h-5"/>
               </button>
            </div>
            <div className="p-6">
              <pre className="text-sm font-mono text-emerald-400 bg-[#0B0F19] p-5 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {getPromptText(selectedPrompt)}
              </pre>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setSelectedPrompt(null)} className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-lg">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-emerald-900/20 to-transparent">
              <Zap className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Upgrade to Sentinel Pro</h2>
              <p className="text-slate-400 text-sm">You have run out of credits for this month on the Agents tier.</p>
            </div>
            <div className="p-6 space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3" /> Unlimited AI Governance Plans</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3" /> Clean, unwatermarked PDF exports</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3" /> Personalized Vault Recommendations</li>
                <li className="flex items-center text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-500 mr-3" /> Weekly Intelligence Briefings</li>
              </ul>
              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-3xl font-extrabold text-white">€79</span>
                  <span className="text-slate-400 ml-1 font-medium">/month</span>
                </div>
                <button 
                  onClick={() => {
                    setTier('pro');
                    setShowPaywall(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                >
                  Subscribe via Redsys
                </button>
                <button 
                  onClick={() => setShowPaywall(false)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}