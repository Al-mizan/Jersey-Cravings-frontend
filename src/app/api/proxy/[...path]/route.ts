import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PROXY_PREFIX = "/api/proxy";

const buildTargetUrl = (request: NextRequest) => {
    if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }

    const { pathname, search } = request.nextUrl;
    const proxiedPath = pathname.replace(PROXY_PREFIX, "");
    const normalizedPath = proxiedPath.startsWith("/")
        ? proxiedPath
        : `/${proxiedPath}`;

    return `${API_BASE_URL}${normalizedPath}${search}`;
};

const proxyRequest = async (request: NextRequest) => {
    const targetUrl = buildTargetUrl(request);
    const headers = new Headers(request.headers);

    headers.delete("host");
    headers.delete("content-length");
    headers.delete("connection");

    const method = request.method.toUpperCase();
    const init: RequestInit = {
        method,
        headers,
        redirect: "manual",
    };

    if (method !== "GET" && method !== "HEAD") {
        init.body = request.body;
    }

    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
};

export async function GET(request: NextRequest) {
    return proxyRequest(request);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request);
}

export async function OPTIONS(request: NextRequest) {
    return proxyRequest(request);
}
