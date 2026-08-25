export async function POST(request) {
    const data = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    console.log("response", response)
    const resData = await response.json();
    console.log("resData", resData)
    return Response.json({ data: resData, status: response.status });
}
