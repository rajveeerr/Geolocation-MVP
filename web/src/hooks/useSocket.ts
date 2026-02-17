import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/useAuth';

/**
 * Singleton Socket.IO connection hook.
 *
 * Connects automatically when the user is authenticated,
 * passes the JWT token via `auth.token`, and joins the
 * server-side `user:{id}` room for targeted events.
 *
 * Best practices applied:
 * - Singleton: one socket per browser tab, shared across components
 * - Ref-counted: socket only disconnects when EVERY consumer unmounts
 * - Stable callbacks: `onNudge` / `emitNudgeAction` use refs to avoid stale closures
 * - Reconnect-safe: never replaces a socket that is mid-reconnect
 * - Logout-safe: disconnects when `user` becomes null
 */

// Derive the WS base from the API base (strip trailing `/api`)
function getSocketUrl(): string {
    const apiBase = import.meta.env.VITE_API_URL || 'https://api.yohop.com/api';
    return apiBase.replace(/\/api\/?$/, '') || apiBase;
}

// ── Module-level singleton ─────────────────────────────────────
let globalSocket: Socket | null = null;
let refCount = 0;

export interface SocketNudge {
    id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    timestamp: string;
}

export function useSocket() {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // ── Not logged in → tear down any existing socket ──
        if (!user) {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                refCount = 0;
            }
            socketRef.current = null;
            setIsConnected(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        // Only create a new socket if none exists.
        // Don't check `globalSocket.connected` — it may be reconnecting.
        if (!globalSocket) {
            globalSocket = io(getSocketUrl(), {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 15000,
            });

            globalSocket.on('connect', () => {
                setIsConnected(true);
            });

            globalSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            globalSocket.on('connect_error', (err) => {
                console.warn('[socket] connect_error:', err.message);
                setIsConnected(false);
            });
        } else {
            // Already have a socket — sync local state
            setIsConnected(globalSocket.connected);
        }

        socketRef.current = globalSocket;
        refCount++;

        return () => {
            refCount--;
            if (refCount <= 0 && globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
                refCount = 0;
                setIsConnected(false);
            }
            socketRef.current = null;
        };
    }, [user]);

    // ── Typed event helpers (stable via refs) ─────────────────
    const onNudge = useCallback((handler: (nudge: SocketNudge) => void) => {
        const s = globalSocket; // read module-level ref, not stale closure
        if (!s) return () => { };
        s.on('nudge', handler);
        return () => {
            s.off('nudge', handler);
        };
    }, [isConnected]); // re-create only when connection status changes

    const emitNudgeAction = useCallback(
        (action: 'nudge:opened' | 'nudge:clicked' | 'nudge:dismissed', userNudgeId: number) => {
            globalSocket?.emit(action, { userNudgeId });
        },
        [],
    );

    return {
        socket: socketRef.current,
        isConnected,
        onNudge,
        emitNudgeAction,
    };
}
