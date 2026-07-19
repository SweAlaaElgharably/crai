import { NextResponse } from "next/server";

const authPages = ["/login", "/register", "/resetpassword", "/forgotpassword"];
const protectedPages = [""];

export default function proxy(request) {
    const { pathname } = request.nextUrl;
    const isAuthPage = authPages.includes(pathname);
    const isProtectedPage = protectedPages.includes(pathname);
    let accessToken = request.cookies.get("access")?.value;
    if (isAuthPage && accessToken) { return NextResponse.redirect(new URL("/", request.url)); }
    return NextResponse.next();
}



// const API_URL = "https://api.arabfinance.com";
// const isProd = process.env.NODE_ENV === "production";
// const paidPages = ["/marketview"];
// function getJwtPayload(token) {
//     try {
//         const base64 = token.split(".")[1];
//         const decoded = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
//         return JSON.parse(decoded);
//     } catch {
//         return null;
//     }
// }

//     let refreshToken = request.cookies.get("refreshToken")?.value;
//     const isPaidPage = paidPages.includes(pathname);
//     if (!accessToken && refreshToken) {
//         const refreshResponse = await fetch(`${API_URL}/api/Auth/refresh`, {method: "POST", headers: 
//             { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken })});
//         if (!refreshResponse.ok) {
//             const response = NextResponse.redirect(new URL("/login", request.url));
//             response.cookies.delete("refreshToken");
//             response.cookies.delete("accessToken");
//             return response;
//         }
//         const { accessToken: newAccessToken } = await refreshResponse.json();
//         const response = NextResponse.next();
//         response.cookies.set("accessToken", newAccessToken, {httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 15,});
//         return response;
//     }
//     if ((isProtectedPage || isPaidPage) && !accessToken) {
//         return NextResponse.redirect(new URL("/login", request.url));
//     }
//     if (isPaidPage && accessToken) {
//         const payload = getJwtPayload(accessToken);
//         const isSubscriber = payload?.isSubscriber === "true";
//         if (!isSubscriber) {
//             return NextResponse.redirect(new URL("/plans", request.url));
//         }
//     }
