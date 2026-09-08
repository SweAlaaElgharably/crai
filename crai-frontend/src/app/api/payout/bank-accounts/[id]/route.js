import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = await params;
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/payout/bank-accounts/${id}/`, {
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

export async function PUT(request, { params }) {
    const { id } = await params;
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const body = await request.arrayBuffer();
        const contentType = request.headers.get("content-type") || "application/octet-stream";
        const response = await fetch(`${process.env.BACKEND_URL}/api/payout/bank-accounts/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": contentType, Authorization: `Bearer ${accessToken}` },
            body: body,
        });
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/payout/bank-accounts/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return new NextResponse(null, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}
