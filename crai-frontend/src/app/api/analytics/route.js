import { NextResponse } from "next/server";

export async function GET(request) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {return NextResponse.json({ detail: "Authentication required." }, { status: 401 });}
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/analytics/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}
