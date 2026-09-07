/**
 * Zentrio Enterprise SEO Agent & Optimization Service
 * Generates Google Schema Markup, Meta Tags, Dynamic Sitemap, Rich FAQ & Robots.txt
 */

const APP_URL = process.env.APP_URL || 'https://zentrio.ai';

// 1. Dynamic Sitemap.xml Generator
function generateSitemap() {
  const baseUrl = process.env.APP_URL || 'https://zentrio.ai';
  const lastMod = new Date().toISOString().split('T')[0];

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { url: '/projects', priority: '0.9', changefreq: 'weekly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/feedback', priority: '0.8', changefreq: 'weekly' },
    { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
    { url: '/refund-policy', priority: '0.4', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
    { url: '/portal/client-login', priority: '0.6', changefreq: 'monthly' },
    { url: '/portal/client-register', priority: '0.6', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

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
  const baseUrl = process.env.APP_URL || 'https://zentrio.ai';
  return `User-agent: *
Allow: /
Allow: /pricing
Allow: /projects
Allow: /contact
Allow: /feedback
Allow: /privacy-policy
Allow: /refund-policy
Allow: /terms-of-service
Allow: /publicity
Disallow: /api/
Disallow: /admin/
Disallow: /uploads/private/

# Host & Sitemap Directives
Host: ${baseUrl}
Sitemap: ${baseUrl}/sitemap.xml
`;
}

// 3. Google JSON-LD Organization & Software Service Schema
function generateJsonLdSchema() {
  const baseUrl = process.env.APP_URL || 'https://zentrio.ai';

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Zentrio AI",
        "url": baseUrl,
        "logo": `${baseUrl}/LOGOO.png`,
        "image": `${baseUrl}/LOGOO.png`,
        "description": "Premier AI Software Engineering & Design Collective providing full-stack web apps, mobile platforms, custom AI chatbots, and machine learning neural models.",
        "foundingDate": "2024",
        "email": "zentriotechnology3@gmail.com",
        "telephone": "+91-9876543210",
        "sameAs": [
          "https://github.com/Rishi4676/ZENTRIO3"
        ],
        "founders": [
          { "@type": "Person", "name": "Syed Rashid", "jobTitle": "Co-Founder & Chief Architect" },
          { "@type": "Person", "name": "Rishigesh", "jobTitle": "CEO & Lead AI Engineer" },
          { "@type": "Person", "name": "Pushparaj", "jobTitle": "Co-Founder & Computer Vision Specialist" }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "48",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Zentrio AI Platform",
        "operatingSystem": "Web, iOS, Android, Linux, Windows",
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
          { "@type": "ListItem", "position": 1, "name": "Full-Stack Web Application (React/Node.js)", "description": "₹9,999" },
          { "@type": "ListItem", "position": 2, "name": "Cross-Platform Mobile Application (Flutter)", "description": "₹15,000" },
          { "@type": "ListItem", "position": 3, "name": "Custom RAG AI Chatbot & Assistant", "description": "₹18,999" },
          { "@type": "ListItem", "position": 4, "name": "Machine Learning & Computer Vision Models", "description": "₹20,000" },
          { "@type": "ListItem", "position": 5, "name": "Predictive Data Analytics Pipeline", "description": "₹12,999" },
          { "@type": "ListItem", "position": 6, "name": "Brand Design & UI/UX Systems", "description": "₹2,000" }
        ]
      }
    ]
  };
}

// 4. FAQ Rich Snippet Schema Generator (Google Rich Results)
function generateFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services does Zentrio AI provide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zentrio AI builds production-ready React web applications, Flutter mobile apps, custom RAG AI chatbots, predictive analytics pipelines, and YOLO computer vision neural models."
        }
      },
      {
        "@type": "Question",
        "name": "How much does custom AI software development cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zentrio AI provides transparent flat-fee catalog pricing starting from ₹999 for foundational setup to ₹20,000 for advanced Machine Learning models."
        }
      },
      {
        "@type": "Question",
        "name": "How fast can Zentrio AI deliver a project?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most web apps and AI chatbots are delivered within 7 to 14 business days with full documentation, source code ownership, and 24/7 technical support."
        }
      }
    ]
  };
}

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  generateJsonLdSchema,
  generateFaqSchema
};
