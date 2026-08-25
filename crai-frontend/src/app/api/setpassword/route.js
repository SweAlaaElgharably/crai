export async function POST(request) {
    const accessToken = request.cookies.get("access")?.value;
    const data = await request.json();
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/set_password/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });
        if (response.status === 204) {return new Response(null, {status: 204});}
        const text = await response.text();
        const result = text ? JSON.parse(text) : null;
        return Response.json(result, {status: response.status});
    } catch (error) {
        return Response.json({data: null}, {status: 500});
    }
}