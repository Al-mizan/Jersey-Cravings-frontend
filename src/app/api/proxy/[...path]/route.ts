import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const makeTargetUrl = (request: NextRequest, pathSegments: string[]) => {
    const path = pathSegments.join("/");
    const targetUrl = new URL(`${API_BASE_URL}/${path}`);
    targetUrl.search = request.nextUrl.search;
    return targetUrl.toString();
};

const forwardRequest = async (
    request: NextRequest,
    pathSegments: string[],
) => {
    const targetUrl = makeTargetUrl(request, pathSegments);
    const method = request.method;

    const outgoingHeaders = new Headers();
    const incomingCookie = request.headers.get("cookie");
    const incomingContentType = request.headers.get("content-type");
    const incomingAuthorization = request.headers.get("authorization");

    if (incomingCookie) {
        outgoingHeaders.set("cookie", incomingCookie);
    }
    if (incomingContentType) {
        outgoingHeaders.set("content-type", incomingContentType);
    }
    if (incomingAuthorization) {
        outgoingHeaders.set("authorization", incomingAuthorization);
    }

    const hasBody = method !== "GET" && method !== "HEAD";
    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(targetUrl, {
        method,
        headers: outgoingHeaders,
        body,
    });

    const responseText = await response.text();
    const nextResponse = new NextResponse(responseText, {
        status: response.status,
    });

    const responseContentType = response.headers.get("content-type");
    if (responseContentType) {
        nextResponse.headers.set("content-type", responseContentType);
    }

    return nextResponse;
};

type ProxyRouteContext = {
    params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: ProxyRouteContext) {
    const { path } = await context.params;
    return forwardRequest(request, path);
}

export async function POST(request: NextRequest, context: ProxyRouteContext) {
    const { path } = await context.params;
    return forwardRequest(request, path);
}

export async function PUT(request: NextRequest, context: ProxyRouteContext) {
    const { path } = await context.params;
    return forwardRequest(request, path);
}

export async function PATCH(request: NextRequest, context: ProxyRouteContext) {
    const { path } = await context.params;
    return forwardRequest(request, path);
}

export async function DELETE(
    request: NextRequest,
    context: ProxyRouteContext,
) {
    const { path } = await context.params;
    return forwardRequest(request, path);
}
