export async function POST(request) {
    const data = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/reset_password_confirm/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const text = await response.text();
    const resData = text ? JSON.parse(text) : null;
    return Response.json({ data: resData, status: response.status });
}