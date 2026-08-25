import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const response = await fetch(`${process.env.BACKEND_URL}/api/contents/${id}/share/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
