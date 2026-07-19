export async function GET(request) {
    const url = new URL(request.url);
    const response = await fetch(`${process.env.BACKEND_URL}/api/contentpreview/?${url.searchParams}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();

    return Response.json({ data: data, status: response.status });
}
