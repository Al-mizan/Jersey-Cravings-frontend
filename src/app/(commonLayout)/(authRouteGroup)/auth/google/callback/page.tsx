import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { redirect } from "next/navigation";

interface GoogleCallbackPageParams {
    searchParams: Promise<{
        code?: string;
        redirect?: string;
        error?: string;
    }>;
}

const GoogleCallbackPage = async ({
    searchParams,
}: GoogleCallbackPageParams) => {
    const params = await searchParams;
    const { code, redirect: redirectPath, error } = params;

    console.log("1. params received:", { code: !!code, redirectPath, error });

    if (!code || error) {
        redirect("/login?error=oauth_failed");
    }

    let tokens: {
        accessToken: string;
        refreshToken: string;
        sessionToken: string;
    } | null = null;

    try {
        console.log("2. calling exchange-oauth-code...");

        const response = await httpClient.post<{
            accessToken: string;
            refreshToken: string;
            sessionToken: string;
        }>("/auth/exchange-oauth-code", { code });
        console.log("3. response:", response.success, !!response.data);

        if (response.success && response.data) {
            tokens = response.data; // just store, don't redirect here
        }
    } catch (err) {
        // swallow — tokens stays null, redirect handled below
        console.error("4. exchange failed:", err); // ← THIS will show the real error
    }
    console.log("5. tokens received:", !!tokens);

    // redirect() is now OUTSIDE try/catch — Next.js can handle it correctly
    if (!tokens) {
        redirect("/login?error=oauth_failed");
    }
    console.log("6. setting cookies...");

    await setTokenInCookies("accessToken", tokens.accessToken);
    await setTokenInCookies("refreshToken", tokens.refreshToken);
    await setTokenInCookies("better-auth.session_token", tokens.sessionToken);
    console.log("7. cookies set, redirecting...");

    const isValid =
        redirectPath?.startsWith("/") === true &&
        redirectPath?.startsWith("//") === false;

    redirect(isValid ? redirectPath! : "/dashboard");
};

export default GoogleCallbackPage;
