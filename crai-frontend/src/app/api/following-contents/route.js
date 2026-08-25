export async function GET(request) {
    const accessToken = request.cookies.get("access")?.value;
    const { searchParams } = new URL(request.url);
    const response = await fetch(`${process.env.BACKEND_URL}/api/following-contents?${searchParams.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return Response.json({ data: data, status: response.status });
}

