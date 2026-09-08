import { NextResponse } from "next/server";

export async function GET(request) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/payout/withdrawals/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}

export async function POST(request) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const payload = await request.json();
        const response = await fetch(`${process.env.BACKEND_URL}/api/payout/withdrawals/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}
