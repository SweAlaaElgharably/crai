import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {
        return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    }
    try {
        const { id } = await params;
        const response = await fetch(`${process.env.BACKEND_URL}/api/comments/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        });
        return new NextResponse(null, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}
