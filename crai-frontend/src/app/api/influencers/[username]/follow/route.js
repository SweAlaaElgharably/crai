import { NextResponse } from "next/server";

async function requestBackend(request, username, method) {
    const accessToken = request.cookies.get("access")?.value;
    if (!accessToken) {return NextResponse.json({ detail: "Authentication required." }, { status: 401 });}
    try {
        const response = await fetch(
            `${process.env.BACKEND_URL}/api/influencers/${username}/follow/`,
            {
                method,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
            }
        );
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ detail: "Something went wrong." }, {status: 500});
    }
}

export async function POST(request, { params }) {
    const { username } = await params;
    return requestBackend(request, username, "POST");
}

export async function DELETE(request, { params }) {
    const { username } = await params;
    return requestBackend(request, username, "DELETE");
}