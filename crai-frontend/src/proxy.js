import { NextResponse } from "next/server";

const authPages = ["/login", "/register", "/resetpassword", "/forgotpassword"];

// Any authenticated user.
const allUsersPages = ["/dashboard", "/explore", "/profile"];

// Client-only pages (/analytics/influencer belongs to influencers).
const clientPages = ["/feed", "/analytics"];

// Influencer-only pages (includes contents CRUD).
const influencerPages = ["/subscribers", "/contents", "/analytics/influencer"];

async function getUser(accessToken) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/me/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        });
        if (!response.ok) { return null; }
        return await response.json();
    } catch {
        return null;
    }
}

function matches(pathname, base) {
    return pathname === base || pathname.startsWith(`${base}/`);
}

export default async function proxy(request) {
    const { pathname } = request.nextUrl;
    const isAuthPage = authPages.includes(pathname);
    const isHomePage = pathname === "/";
    const isInfluencerPage = influencerPages.some((page) => matches(pathname, page));
    const isClientPage = !isInfluencerPage && clientPages.some((page) => matches(pathname, page));
    const needsAuth = isInfluencerPage || isClientPage || allUsersPages.some((page) => matches(pathname, page));

    if (!isAuthPage && !needsAuth && !isHomePage) { return NextResponse.next(); }

    const accessToken = request.cookies.get("access")?.value;
    const user = accessToken ? await getUser(accessToken) : null;
    const userType = user?.is_staff ? "staff" : user?.user_type || null;

    if (isAuthPage && userType) { return NextResponse.redirect(new URL("/dashboard", request.url)); }
    if (isHomePage && userType) { return NextResponse.redirect(new URL("/dashboard", request.url)); }

    if (needsAuth) {
        if (!userType) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (userType === "staff") { return NextResponse.next(); }
        if (isInfluencerPage && userType !== "influencer") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (isClientPage && userType !== "client") {
            return NextResponse.redirect(new URL("/analytics/influencer", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {matcher: ["/:path*"]};
