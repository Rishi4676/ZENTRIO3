/**
 * Zentrio Enterprise SEO Agent & Optimization Service
 * Generates Google Schema Markup, Meta Tags, Dynamic Sitemap & Robots.txt
 */

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// 1. Dynamic Sitemap.xml Generator
function generateSitemap() {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const lastMod = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { url: '/projects', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/feedback', priority: '0.7', changefreq: 'monthly' },
    { url: '/portal/client-login', priority: '0.6', changefreq: 'monthly' },
    { url: '/portal/client-register', priority: '0.6', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  pages.forEach(p => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${p.url}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

// 2. Dynamic Robots.txt Generator
function generateRobotsTxt() {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `User-agent: *
Allow: /
Allow: /pricing
Allow: /projects
Allow: /contact
Allow: /feedback
Allow: /publicity
Disallow: /api/
Disallow: /uploads/private/

Sitemap: ${baseUrl}/sitemap.xml
`;
}

// 3. Google JSON-LD Organization & Software Service Schema
function generateJsonLdSchema() {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Zentrio AI",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "Premier AI Software Engineering & Design Collective providing web apps, mobile apps, custom AI chatbots, and machine learning models.",
        "foundingDate": "2024",
        "email": "zentriotechnology3@gmail.com",
        "telephone": "+1-555-234-5678",
        "sameAs": [
          "https://github.com/Rishi4676/ZENTRIO3"
        ],
        "founders": [
          { "@type": "Person", "name": "Syed Rashid", "jobTitle": "Co-Founder & Chief Architect" },
          { "@type": "Person", "name": "Rishigesh", "jobTitle": "CEO & Lead AI Engineer" },
          { "@type": "Person", "name": "Pushparaj", "jobTitle": "Co-Founder & Computer Vision Specialist" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Zentrio AI Platform",
        "operatingSystem": "Web, iOS, Android",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": "999",
          "highPrice": "20000",
          "offerCount": "8"
        }
      },
      {
        "@type": "ItemList",
        "name": "Zentrio Service Catalog",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Web Application (React/Node.js)", "description": "₹9,999" },
          { "@type": "ListItem", "position": 2, "name": "Mobile Application (Flutter/React Native)", "description": "₹15,000" },
          { "@type": "ListItem", "position": 3, "name": "AI Chatbot & Assistant", "description": "₹18,999" },
          { "@type": "ListItem", "position": 4, "name": "Machine Learning & YOLO Models", "description": "₹20,000" },
          { "@type": "ListItem", "position": 5, "name": "Data Analytics Pipeline", "description": "₹12,999" },
          { "@type": "ListItem", "position": 6, "name": "Branding & Logo Design", "description": "₹2,000" }
        ]
      }
    ]
  };
}

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  generateJsonLdSchema
};
