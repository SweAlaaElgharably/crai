import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

export async function POST(request) {
    const data = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/jwt/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (response.ok) {
        const cookieStore = await cookies();
        cookieStore.set("access", resData.access, {httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24});
        cookieStore.set("refresh", resData.refresh, {httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30});
    }
    return NextResponse.json({status: response.status});
}