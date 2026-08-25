import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const accessToken = request.cookies.get("access")?.value;
    const { username } = await params;
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/influencers/${username}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                cache: "no-store",
            }
        );
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, { status: 500 });
    }
}