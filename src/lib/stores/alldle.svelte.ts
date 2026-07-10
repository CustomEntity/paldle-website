// ============================================
// AllDle SDK Store — Brawldle integration
//
// The AllDle SDK is loaded by AllDle in the iframe via CDN.
// This store wraps connect() and completeMode() so any game
// page can notify AllDle of a win with a single call.
//
// Outside of an AllDle iframe (direct access / local dev),
// connect() returns null and all SDK calls are silently skipped.
// ============================================

import { browser } from '$app/environment';

// ---- Types matching the AllDle SDK (keep in sync with packages/sdk) ----

export interface AllDleSessionInfo {
    userId: string;
    displayName: string;
    avatar: string | null;
    isAuthenticated: boolean;
    gameSlug: string;
    token: string;
}

export interface ModeCompletionData {
    won: boolean;
    attempts?: number;
}

// ---- Reactive state ----

let session = $state<AllDleSessionInfo | null>(null);
let sdkInstance: any = null;
let initialized = false;

// ---- Init (call once from +layout.svelte) ----

export async function initAllDle(): Promise<void> {
    if (!browser || initialized) return;
    initialized = true;

    // The SDK exposes window.AllDle when loaded via cdn.alldle.net/sdk.js
    // The SDK IIFE build exposes window.AllDleSDK = { AllDle: class AllDle {...} }
    // (globalName: 'AllDleSDK' in tsup.config.ts)
    const AllDleCls = (window as any).AllDleSDK?.AllDle;
    if (!AllDleCls) {
        // SDK not present — running outside AllDle iframe, that's fine.
        return;
    }

    sdkInstance = new AllDleCls({
        gameSlug: 'brawldle',
        apiBaseUrl: 'https://www.alldle.net/api',
        debug: false,
        connectTimeout: 30000, // 30s — AllDle sends the session on Play click, which can be long after iframe load
    });

    session = await sdkInstance.connect();
}

// ---- completeMode wrapper ----

/**
 * Notify AllDle that the player has completed a game mode.
 * Safe to call even when running outside an AllDle iframe —
 * it will silently skip if there is no active session.
 *
 * @param mode     One of 'villager' | 'gadget' | 'star_power' | 'hypercharge' | 'pixel'
 * @param data     { won: boolean, attempts?: number }
 */
export async function notifyModeComplete(
    mode: 'villager' | 'crop' | 'fish',
    data: ModeCompletionData
): Promise<void> {
    if (!sdkInstance || !session) return;
    await sdkInstance.completeMode(mode, data);
}

// ---- Readable session state ----

export const alldleSession = {
    get value() {
        return session;
    },
    get isAuthenticated() {
        return session?.isAuthenticated ?? false;
    },
};
