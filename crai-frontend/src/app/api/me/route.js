export async function GET(request) {
    const accessToken = request.cookies.get("access")?.value;
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/me/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });
        const data = await response.json();
        return Response.json(data, {status: response.status});
    } catch (error) {
        return Response.json({data: null}, {status: 500});
    }
}

export async function PATCH(request) {
    const accessToken = request.cookies.get("access")?.value;
    const formData = await request.formData();
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/me/`, {
            method: "PATCH",
            headers: {"Authorization": `Bearer ${accessToken}`},
            body: formData,
            cache: "no-store",
        });
        const data = await response.json();
        return Response.json(data, {status: response.status});
    } catch (error) {
        return Response.json({data: null}, {status: 500});
    }
}