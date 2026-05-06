import { createAuthClient } from "better-auth/react";

// Better-Auth requires an absolute URL (it uses `new URL(baseURL)`).
// Always point to the frontend's own /api/auth proxy — this works for both
// SSR and browser since the proxy forwards to the backend.
const baseURL = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth`;

export const authClient = createAuthClient({
    baseURL,
    fetchOptions: {
        credentials: "include",
    },
});

// import { createAuthClient } from "better-auth/client";
// const authClient = createAuthClient();

// const signIn = async () => {
//   const data = await authClient.signIn.social({
//     provider: "google",
//   });
// };