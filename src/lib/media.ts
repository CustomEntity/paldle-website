import { env } from '$env/dynamic/public';

// Base URL for entity media (portraits / crop & fish icons). Served from the GCS bucket
// (PUBLIC_MEDIA_URL, e.g. https://media.stardewdle.net/). Falls back to the local /static
// root when the var is unset, so dev without the bucket still works.
const BASE = (env.PUBLIC_MEDIA_URL || '/').replace(/\/*$/, '/');

/** Prefix a relative asset path (e.g. "/portraits/Abigail.png") with the media base. */
export const media = (path: string): string =>
	BASE + String(path ?? '').replace(/^\/+/, '');
