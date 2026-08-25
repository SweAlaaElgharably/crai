import { NextResponse } from "next/server";

async function requestBackend(request, method) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {return NextResponse.json({ detail: "Authentication required." }, { status: 401 });}
    try {
        const contentType = request.headers.get("content-type") || "";
        const isMultipart = contentType.includes("multipart/form-data");
        const headers = { Authorization: `Bearer ${accessToken}` };
        if (!isMultipart && contentType && method !== "GET") {headers["Content-Type"] = contentType;}
        const acceptLanguage = request.headers.get("accept-language");
        if (acceptLanguage) {headers["Accept-Language"] = acceptLanguage;}
        let body;
        if (method !== "GET") {
            body = isMultipart ? await request.formData() : await request.text();
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/contents/`, {
            method,
            headers,
            body,
            cache: "no-store",
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}

export async function GET(request) {
    return requestBackend(request, "GET");
}

export async function POST(request) {
    return requestBackend(request, "POST");
}
