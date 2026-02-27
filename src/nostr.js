/**
 * src/nostr.js — Complete Nostr integration for AI Sentinel
 *
 * Provides: key generation, relay WebSocket management, event signing,
 * React context, and the Trustee Handshake protocol (kind 24133 / NIP-46).
 *
 * IMPORTS: Uses nostr-tools v2. If CRA build fails on these imports, try:
 *   import * as NostrTools from 'nostr-tools'
 *   then use NostrTools.generateSecretKey(), etc.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

// --- nostr-tools v2 imports ---
// These are re-exported from the main entry in v2.10+
import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
} from 'nostr-tools/pure';
import * as nip19 from 'nostr-tools/nip19';

// ============================================================================
//  CONSTANTS
// ============================================================================

export const RELAY_URLS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

export const HANDSHAKE_KIND = 24133; // NIP-46 Nostr Connect

// ============================================================================
//  KEY HELPERS
// ============================================================================

export function createKeypair() {
  const sk = generateSecretKey(); // Uint8Array(32)
  const pk = getPublicKey(sk);    // hex string
  const npub = nip19.npubEncode(pk);
  return { sk, pk, npub };
}

export function npubToHex(npubStr) {
  try {
    const decoded = nip19.decode(npubStr);
    if (decoded.type === 'npub') return decoded.data;
  } catch {}
  // If it's already hex (64 chars), return as-is
  if (/^[0-9a-f]{64}$/i.test(npubStr)) return npubStr;
  return null;
}

export function truncateKey(hex, n = 8) {
  if (!hex) return '…';
  return `${hex.slice(0, n)}…${hex.slice(-n)}`;
}

export function hexToNpub(hex) {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return hex;
  }
}

// ============================================================================
//  RELAY MANAGER (raw WebSocket, zero extra deps)
// ============================================================================

export class RelayManager {
  constructor(urls = RELAY_URLS) {
    this.urls = urls;
    this.sockets = new Map();        // url → WebSocket
    this.statusMap = new Map();      // url → 'connecting'|'connected'|'error'
    this.subs = new Map();           // subId → { filter, onEvent }
    this.onStatusChange = null;      // callback when any relay status changes
    this.eventLog = [];              // [{direction, relay, raw}] for debug panel
    this.onEventLog = null;
  }

  connect() {
    this.urls.forEach((url) => this._connectOne(url));
  }

  _connectOne(url) {
    if (this.sockets.get(url)?.readyState === WebSocket.OPEN) return;
    this.statusMap.set(url, 'connecting');
    this._notify();

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        this.statusMap.set(url, 'connected');
        this._notify();
        // Re-send any active subscriptions to this new socket
        for (const [subId, { filter }] of this.subs) {
          ws.send(JSON.stringify(['REQ', subId, filter]));
        }
      };

      ws.onclose = () => {
        this.statusMap.set(url, 'error');
        this.sockets.delete(url);
        this._notify();
        // Auto-reconnect after 4s
        setTimeout(() => this._connectOne(url), 4000);
      };

      ws.onerror = () => {
        this.statusMap.set(url, 'error');
        this._notify();
      };

      ws.onmessage = (e) => {
        this._log('IN', url, e.data);
        try {
          const msg = JSON.parse(e.data);
          if (msg[0] === 'EVENT' && msg[2]) {
            const subId = msg[1];
            const event = msg[2];
            this.subs.get(subId)?.onEvent(event);
          }
          // OK responses: ['OK', eventId, success, message]
          // We silently accept these
        } catch {}
      };

      this.sockets.set(url, ws);
    } catch {
      this.statusMap.set(url, 'error');
      this._notify();
    }
  }

  subscribe(filter, onEvent) {
    const subId = 'sub_' + Math.random().toString(36).slice(2, 9);
    this.subs.set(subId, { filter, onEvent });
    for (const [, ws] of this.sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(['REQ', subId, filter]));
      }
    }
    // Return unsubscribe function
    return () => {
      this.subs.delete(subId);
      for (const [, ws] of this.sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify(['CLOSE', subId])); } catch {}
        }
      }
    };
  }

  publish(event) {
    const msg = JSON.stringify(['EVENT', event]);
    let sent = 0;
    for (const [url, ws] of this.sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        this._log('OUT', url, msg);
        sent++;
      }
    }
    return sent;
  }

  connectedCount() {
    return [...this.statusMap.values()].filter((s) => s === 'connected').length;
  }

  totalCount() {
    return this.urls.length;
  }

  disconnect() {
    for (const [, ws] of this.sockets) {
      try { ws.close(); } catch {}
    }
    this.sockets.clear();
    this.subs.clear();
    this.statusMap.clear();
  }

  _notify() {
    this.onStatusChange?.(Object.fromEntries(this.statusMap));
  }

  _log(direction, relay, raw) {
    const entry = {
      time: new Date().toISOString().slice(11, 23),
      direction,
      relay: new URL(relay).hostname,
      raw: typeof raw === 'string' ? raw.slice(0, 300) : raw,
    };
    this.eventLog.push(entry);
    if (this.eventLog.length > 100) this.eventLog.shift();
    this.onEventLog?.(entry);
  }
}

// ============================================================================
//  REACT CONTEXT
// ============================================================================

const NostrContext = createContext(null);
export const useNostr = () => useContext(NostrContext);

export function NostrProvider({ children, existingKeypair = null }) {
  const [keypair, setKeypair] = useState(null);
  const [relayStatus, setRelayStatus] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const managerRef = useRef(null);

  useEffect(() => {
    // Generate or use provided keypair
    const kp = existingKeypair || createKeypair();
    setKeypair(kp);

    // Connect relays
    const mgr = new RelayManager(RELAY_URLS);
    mgr.onStatusChange = (status) => setRelayStatus({ ...status });
    mgr.onEventLog = (entry) =>
      setEventLog((prev) => [...prev.slice(-49), entry]);
    mgr.connect();
    managerRef.current = mgr;

    return () => mgr.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = useCallback((filter, onEvent) => {
    return managerRef.current?.subscribe(filter, onEvent);
  }, []);

  const signAndPublish = useCallback(
    (kind, content, tags) => {
      if (!keypair || !managerRef.current) return null;
      const event = finalizeEvent(
        {
          kind,
          created_at: Math.floor(Date.now() / 1000),
          tags,
          content,
        },
        keypair.sk
      );
      managerRef.current.publish(event);
      return event;
    },
    [keypair]
  );

  const connectedCount = Object.values(relayStatus).filter(
    (s) => s === 'connected'
  ).length;

  return (
    <NostrContext.Provider
      value={{
        keypair,
        relayStatus,
        connectedCount,
        totalRelays: RELAY_URLS.length,
        eventLog,
        subscribe,
        signAndPublish,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
}

// ============================================================================
//  HANDSHAKE HOOK  —  Used by Advisor to link a Trustee
// ============================================================================

export function useHandshake() {
  const ctx = useNostr();
  const [state, setState] = useState('idle');
  // idle | requesting | verifying | linked | timeout
  const [trusteePk, setTrusteePk] = useState(null);
  const [trusteeInput, setTrusteeInput] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [linkedEvent, setLinkedEvent] = useState(null);
  const unsubRef = useRef(null);
  const timeoutRef = useRef(null);

  const startHandshake = useCallback(
    (inputValue) => {
      if (!ctx?.keypair || !ctx?.signAndPublish) return;

      // Resolve input to hex pubkey
      const hex = npubToHex(inputValue?.trim());
      if (!hex) {
        alert('Invalid npub or hex pubkey');
        return;
      }
      setTrusteePk(hex);
      setState('requesting');

      const reqId = 'req_' + Math.random().toString(36).slice(2, 9);
      setRequestId(reqId);

      // 1) Publish kind:24133 connect request
      const payload = JSON.stringify({
        id: reqId,
        method: 'connect',
        params: [ctx.keypair.pk],
      });
      ctx.signAndPublish(HANDSHAKE_KIND, payload, [['p', hex]]);

      // 2) Transition to "verifying" after a beat (simulates NIP-05 check)
      setTimeout(() => setState('verifying'), 1800);

      // 3) Subscribe for the trustee's ack response
      const sinceTs = Math.floor(Date.now() / 1000) - 5;
      unsubRef.current = ctx.subscribe(
        {
          kinds: [HANDSHAKE_KIND],
          '#p': [ctx.keypair.pk],
          since: sinceTs,
        },
        (event) => {
          try {
            const body = JSON.parse(event.content);
            if (body.id === reqId && body.result === 'ack') {
              setState('linked');
              setTrusteePk(event.pubkey);
              setLinkedEvent(event);
              unsubRef.current?.();
              clearTimeout(timeoutRef.current);
            }
          } catch {}
        }
      );

      // 4) Timeout fallback (90 seconds)
      timeoutRef.current = setTimeout(() => {
        setState((prev) => (prev === 'linked' ? prev : 'timeout'));
        unsubRef.current?.();
      }, 90000);
    },
    [ctx]
  );

  const reset = useCallback(() => {
    unsubRef.current?.();
    clearTimeout(timeoutRef.current);
    setState('idle');
    setTrusteePk(null);
    setRequestId(null);
    setLinkedEvent(null);
  }, []);

  useEffect(() => {
    return () => {
      unsubRef.current?.();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    state,
    trusteePk,
    trusteeInput,
    setTrusteeInput,
    requestId,
    linkedEvent,
    startHandshake,
    reset,
  };
}

// ============================================================================
//  TRUSTEE LISTENER HOOK  —  Used by TrusteeView to receive requests
// ============================================================================

export function useTrusteeListener() {
  const ctx = useNostr();
  const [requests, setRequests] = useState([]);
  const [approvedIds, setApprovedIds] = useState(new Set());

  // Subscribe for incoming handshake requests
  useEffect(() => {
    if (!ctx?.keypair) return;
    const sinceTs = Math.floor(Date.now() / 1000) - 10;
    const unsub = ctx.subscribe(
      {
        kinds: [HANDSHAKE_KIND],
        '#p': [ctx.keypair.pk],
        since: sinceTs,
      },
      (event) => {
        try {
          const body = JSON.parse(event.content);
          if (body.method === 'connect') {
            setRequests((prev) => {
              // Deduplicate by event id
              if (prev.some((r) => r.eventId === event.id)) return prev;
              return [
                ...prev,
                {
                  eventId: event.id,
                  requestId: body.id,
                  advisorPk: event.pubkey,
                  advisorNpub: hexToNpub(event.pubkey),
                  timestamp: event.created_at,
                },
              ];
            });
          }
        } catch {}
      }
    );
    return unsub;
  }, [ctx]);

  const approve = useCallback(
    (request) => {
      if (!ctx?.signAndPublish) return;
      const payload = JSON.stringify({
        id: request.requestId,
        result: 'ack',
      });
      ctx.signAndPublish(HANDSHAKE_KIND, payload, [['p', request.advisorPk]]);
      setApprovedIds((prev) => new Set([...prev, request.requestId]));
    },
    [ctx]
  );

  return { requests, approve, approvedIds };
}
