# AI Sentinel — Nostr-Integrated Bitcoin Custody Platform

## Quick Setup (< 5 minutes)

```bash
# 1. Install dependencies (adds nostr-tools)
npm install

# 2. Start the dev server
npm start
```

The app opens at `http://localhost:3000`.

## Demo Flow: Trustee Handshake

This demo shows **real Nostr protocol communication** between an Advisor and a Trustee (Lawyer) across live WebSocket relay connections.

### Step-by-step

1. **Open the Advisor app** at `http://localhost:3000`
   - Check the sidebar: the relay status pill shows `X/3 Relays` connected.

2. **Open the Trustee simulator** by clicking the green **"Open Trustee Demo"** button in the sidebar (or go to `http://localhost:3000?trustee=true` manually).

3. **In the Trustee tab**, copy the displayed **npub** (click the Copy button).

4. **Back in the Advisor tab**:
   - Go to **Audit Trail** → click **"Sign & Finalize"** on any plan.
   - Choose **"Configure Inheritance Vault"** (the Legacy Bridge option).
   - In the Trustee/Lawyer row, **paste the npub** into the input field.
   - Click **"Orchestrate via Nostr"**.

5. **Watch the handshake live**:
   - The Advisor publishes a `kind:24133` event to connected Nostr relays.
   - The **Trustee tab** receives the request in real-time (you'll see it appear).
   - Click **"Approve"** in the Trustee tab.
   - The **Advisor tab** receives the acknowledgment and transitions to **"Linked"**.
   - The miniscript descriptor updates with the trustee's pubkey.

6. **Open the Event Log** (toggle in sidebar) to see raw Nostr events flowing.

### What's real vs simulated

| Component | Real | Simulated |
|---|---|---|
| WebSocket connections to Nostr relays | ✅ | |
| Keypair generation (secp256k1 Schnorr) | ✅ | |
| Event signing (NIP-01 compliant) | ✅ | |
| kind:24133 handshake events (NIP-46) | ✅ | |
| Relay fan-out to 3 relays | ✅ | |
| NIP-05 identity resolution | | ✅ (visual only) |
| Agentic Firewall (OpenClaw) | | ✅ (setTimeout) |
| AI Agent Swarm orchestration | | ✅ (setTimeout) |

## Architecture

```
src/
├── nostr.js           # Complete Nostr module:
│                      #   - RelayManager (raw WebSocket)
│                      #   - Key generation & NIP-19 encoding
│                      #   - Event signing via nostr-tools
│                      #   - React Context (NostrProvider)
│                      #   - useHandshake() hook
│                      #   - useTrusteeListener() hook
├── TrusteeView.js     # Standalone trustee/lawyer simulator
├── App.js             # Main advisor app with Nostr integration
├── index.js           # URL routing (?trustee=true)
├── index.css          # Tailwind directives
└── App.css            # Animation keyframes
```

## Troubleshooting

**Build fails on nostr-tools imports?**
Try changing the imports in `src/nostr.js` from:
```js
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
```
to:
```js
import * as NostrTools from 'nostr-tools'
const { finalizeEvent, generateSecretKey, getPublicKey, nip19 } = NostrTools
```

**Relays not connecting?**
Check browser console for WebSocket errors. Some corporate networks block WSS connections. Try a different network or use a VPN.

**Handshake not received?**
Both tabs must be connected to at least one common relay. Check the relay status in both tabs. Relay propagation can take 1-3 seconds.

## Technologies

- **React 19** + **Tailwind CSS** + **lucide-react**
- **nostr-tools v2** (Schnorr key generation, event signing, NIP-19 encoding)
- **Raw WebSocket** relay management (no SimplePool dependency)
- **NIP-01** (events), **NIP-19** (bech32 encoding), **NIP-46** (Nostr Connect)
