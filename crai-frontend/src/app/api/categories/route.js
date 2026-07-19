export async function GET(request) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/categories`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return Response.json({ data: data, status: response.status });
}
