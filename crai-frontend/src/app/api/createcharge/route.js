import { NextResponse } from "next/server";

export async function POST(request) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ data: { detail: "Authentication required." } }, { status: 401 });
    }
    try {
        const payload = await request.json();
        const response = await fetch(`${process.env.BACKEND_URL}/api/createcharge/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json({ data }, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ data: { ok: false, error: "Something went wrong." }, status: 500 });
    }
}
