// Create a map of string client ids and secrets.
// TODO: Add a backend data store.
const clients: Record<string, string> = {
    "client-id-1": "client-secret-1",
    "client-id-2": "client-secret-2",
};

const users: Record<string, string> = {
    "user-id-1": "user-password-1",
    "user-id-2": "user-password-2",
};

const server = Bun.serve({
    async fetch(req) {
        const path = new URL(req.url).pathname;
        
        if (req.method === "GET" && path === "/authorize") {
            const params = new URL(req.url).searchParams;
            const responseType = params.get("response_type");
            const clientId = params.get("client_id");
            const redirectUri = params.get("redirect_uri");
            const scope = params.get("scope");
            const state = params.get("state");

            if (!clientId || !responseType || !redirectUri || !scope || !state) {
                return new Response("Missing required parameters", { status: 400 });
            }

            if (!clients[clientId]) {
                return new Response("Invalid client id", { status: 401 });
            }

            return new Response("Authorize", { status: 200 });
        } else if (req.method === "POST" && path === "/token") {
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
                });
            } else if (grantType === "password") {
                const clientId: string = data["client_id"];
                const clientSecret: string = data["client_secret"];
                const userId: string = data["username"];
                const userPassword: string = data["password"];

                if (clients[clientId] !== clientSecret) {
                    return new Response("Invalid client credentials", { status: 401 });
                }

                if (users[userId] !== userPassword) {
                    return new Response("Invalid user credentials", { status: 401 });
                }

                return Response.json({
                    access_token: "some-access-token",
                    token_type: "Bearer",
                    expires_in: 3600,
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