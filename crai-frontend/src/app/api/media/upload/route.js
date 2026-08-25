import { NextResponse } from "next/server";

export async function POST(request) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {return NextResponse.json({ detail: "Authentication required." }, { status: 401 });}
    try {
        const formData = await request.formData();
        const response = await fetch(`${process.env.BACKEND_URL}/api/media/upload/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
            cache: "no-store",
        });
        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            console.error("Upload upstream non-JSON response:", text?.slice(0, 300));
            data = { detail: `Upstream error (HTTP ${response.status}).` };
        }
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}
