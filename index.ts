// Create a map of string client ids and secrets.
// TODO: Add a backend data store.
const clients: Record<string, string> = {
    "client-id-1": "client-secret-1",
    "client-id-2": "client-secret-2",
};

const server = Bun.serve({
    async fetch(req) {
        const path = new URL(req.url).pathname;

        if (path === "/token") {
            const data = await req.json();
            
            const grantType: string = data["grant_type"];

            if (grantType === "client_credentials") {
                const clientId: string = data["client_id"];
                const clientSecret: string = data["client_secret"];

                if (clients[clientId] !== clientSecret) {
                    return new Response("Invalid client credentials", { status: 401 });
                }

                return Response.json({
                    access_token: "some-access-token",
                    token_type: "Bearer",
                    expires_in: 3600,
                    refresh_token: "some-refresh-token",
                    scope: "some-scope",
                });
            }

            return Response.json({
                error: "unsupported_grant_type",
                error_description: "The authorization grant type is not supported by the authorization server.",
                error_uri: "some-error-uri",
            }, { status: 400 });
        }

        return new Response("Not found", { status: 404 });
    }
})

console.log(`Listening on ${server.url}`);