import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const { id } = await params;
        const response = await fetch(`${process.env.BACKEND_URL}/api/contents/${id}/like/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
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
