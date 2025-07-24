import { generateSitemapXML } from '../sitemap';

export async function GET() {
  const sitemap = await generateSitemapXML();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}