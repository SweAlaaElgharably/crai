export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api",
        "/dashboard",
        "/explore",
        "/profile",
        "/feed",
        "/analytics",
        "/contents",
        "/content",
        "/subscribers",
        "/payout",
        "/checkout",
        "/login",
        "/register",
        "/forgotpassword",
        "/resetpassword",
        "/activation",
      ],
    },
    sitemap: "https://cr-ai.cloud/sitemap.xml",
  };
}