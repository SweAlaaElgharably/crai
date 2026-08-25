import { NextResponse } from "next/server";

async function forward(request, { params }, body) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const { id } = await params;
        const response = await fetch(`${process.env.BACKEND_URL}/api/contents/${id}/comments/`, {
            method: request.method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: body ? JSON.stringify(body) : undefined,
            cache: "no-store",
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data || {}, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}

export async function GET(request, context) {
    return forward(request, context);
}

export async function POST(request, context) {
    let payload = {};
    try { payload = await request.json(); } catch {}
    return forward(request, context, payload);
}
