import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

export async function GET(request) {
    const cookieStore = await cookies();
    let access = cookieStore.get("access")?.value;
    if (!access) {
        const refresh = cookieStore.get("refresh")?.value;
        if (!refresh) {
            return NextResponse.json({data: null, status: 401});
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/jwt/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({refresh}),
        });
        if (response.ok) {
            const resData = await response.json();
            cookieStore.set("access", resData.access, {httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24});
        }
    }
    access = cookieStore.get("access")?.value;
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/me/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
        },
    });
    console.log("response", response);
    const resData = await response.json();
    console.log("resData", resData);
    return NextResponse.json({data: resData, status: response.status});
}