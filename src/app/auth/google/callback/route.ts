import { setTokenInCookies } from "@/lib/tokenUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { NextRequest, NextResponse } from "next/server";

interface ExchangeResponse {
    accessToken: string;
    refreshToken: string;
    redirectPath: string;
}

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (error || !code) {
        return NextResponse.redirect(
            `${frontendUrl}/login?error=${error || "oauth_failed"}`,
        );
    }

    try {
        const response = await httpClient.post<ExchangeResponse>(
            "/auth/google/exchange",
            { code },
        );

        const { accessToken, refreshToken, redirectPath } = response.data;

        // ✅ Route Handler এ cookie set করা যায়
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);

        return NextResponse.redirect(
            `${frontendUrl}${redirectPath || "/"}`,
        );
    } catch (err) {
        console.error("OAuth exchange error:", err);
        return NextResponse.redirect(
            `${frontendUrl}/login?error=oauth_failed`,
        );
    }
};