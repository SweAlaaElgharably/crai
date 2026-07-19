export async function POST(request) {
    const data = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const resData = await response.json();
    return Response.json({ data: resData, status: response.status });
}
