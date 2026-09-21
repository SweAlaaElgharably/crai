export const revalidate = 86400;

export default async function sitemap() {
  const base = "https://cr-ai.cloud";
  const lastModified = new Date();
  const staticPages = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/creators", priority: 0.8, changeFrequency: "daily" },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
    { path: "/policy", priority: 0.5, changeFrequency: "yearly" },
  ];

  const urls = staticPages.map((page) => ({
    url: base + page.path,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/influencers/`, { next: { revalidate: 86400 } });
    if (response.ok) {
      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results || [];
      for (const influencer of results) {
        if (influencer?.username) {
          urls.push({
            url: `${base}/@/${influencer.username}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    // Backend unreachable — sitemap still contains the static pages.
  }

  return urls;
}