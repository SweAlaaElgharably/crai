import { NextResponse } from "next/server";

async function requestBackend(request, id, method) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {return NextResponse.json({ detail: "Authentication required." }, { status: 401 });}
    try {
        const contentType = request.headers.get("content-type") || "";
        const isMultipart = contentType.includes("multipart/form-data");
        const headers = { Authorization: `Bearer ${accessToken}` };
        if (!isMultipart && contentType && method !== "GET" && method !== "DELETE") {headers["Content-Type"] = contentType;}
        const acceptLanguage = request.headers.get("accept-language");
        if (acceptLanguage) {headers["Accept-Language"] = acceptLanguage;}
        let body;
        if (method !== "GET" && method !== "DELETE") {
            body = isMultipart ? await request.formData() : await request.text();
        }
        const response = await fetch(`${process.env.BACKEND_URL}/api/contents/${id}/`, {
            method,
            headers,
            body,
            cache: "no-store",
        });
        const text = await response.text();
        if (response.status === 204 || !text) {
            return new NextResponse(null, { status: response.status });
        }
        const data = JSON.parse(text);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    const { id } = await params;
    return requestBackend(request, id, "GET");
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    return requestBackend(request, id, "PATCH");
}

export async function PUT(request, { params }) {
    const { id } = await params;
    return requestBackend(request, id, "PUT");
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    return requestBackend(request, id, "DELETE");
}
