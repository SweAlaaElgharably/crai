import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request) {
    const limitResponse = rateLimit(request, "contact");
    if (limitResponse) return limitResponse;
    const data = await request.json();
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/contact/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            cache: "no-store",
        });
        const text = await response.text();
        const result = text ? JSON.parse(text) : null;
        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}