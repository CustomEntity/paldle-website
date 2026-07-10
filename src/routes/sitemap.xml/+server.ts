import { SITE_ORIGIN } from '$lib/constants';

export const prerender = true;

const PAGES: { path: string; changefreq: string; priority: string }[] = [
	{ path: '/', changefreq: 'daily', priority: '1.0' },
	{ path: '/villager', changefreq: 'daily', priority: '0.9' },
	{ path: '/crop', changefreq: 'daily', priority: '0.9' },
	{ path: '/fish', changefreq: 'daily', priority: '0.9' }
];

export async function GET() {
	const lastmod = new Date().toISOString().split('T')[0];
	const urls = PAGES.map(
		(p) => `  <url>
    <loc>${SITE_ORIGIN}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
