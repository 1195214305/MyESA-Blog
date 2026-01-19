export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/projects')) {
        const data = [
            { id: 1, name: "EcoLens", views: 1205 },
            { id: 2, name: "EdgeAI Pro", views: 980 }
        ];

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    return new Response("Not Found", { status: 404 });
}
