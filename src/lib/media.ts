// Media resolution.
//
// Pal icons are self-hosted under static/pals/<key>.webp and served directly by the
// app, so palImg() returns a plain local path and works in dev and prod as-is. When
// the assets move to a CDN, point PUBLIC_MEDIA_URL at it and switch palImg() to media().
// The pal_media DB table already records every media path for that migration.

import { env } from '$env/dynamic/public';

// Base URL for CDN-served media (e.g. https://media.paldle.gg/). Falls back to the local
// /static root when unset, so dev without the bucket still works.
const BASE = (env.PUBLIC_MEDIA_URL || '/').replace(/\/*$/, '/');

/** Prefix a relative asset path with the media base (CDN when configured). */
export const media = (path: string): string =>
	BASE + String(path ?? '').replace(/^\/+/, '');

/** Local URL for a Pal icon (served from static/pals/). Single switch point for the CDN. */
export const palImg = (path: string | null | undefined): string =>
	String(path ?? '').startsWith('/') ? String(path) : `/pals/${path ?? ''}.webp`;

/** Local URL for a Pal cry (served from static/sounds/<key>.ogg). Same CDN switch point. */
export const palAudio = (key: string | null | undefined): string =>
	String(key ?? '').startsWith('/') ? String(key) : `/sounds/${key ?? ''}.ogg`;

/** Datamined Palworld element icon (static/ui/elements/<Element>.webp). */
export const elemIcon = (el: string | null | undefined): string => `/ui/elements/${el ?? 'Neutral'}.webp`;

/** Datamined Palworld work-suitability icon (static/ui/work/<Label>.webp). */
export const workIcon = (label: string | null | undefined): string => `/ui/work/${label ?? ''}.webp`;
