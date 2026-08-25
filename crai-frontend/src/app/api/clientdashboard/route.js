export async function GET(request) {
    const accessToken = request.cookies.get("access")?.value;
    const response = await fetch(`${process.env.BACKEND_URL}/api/clientdashboard`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
}