import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const buildTargetUrl = (path: string[], search: string) => {
    const normalizedBase = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
    const normalizedPath = path.join("/");
    return `${normalizedBase}/${normalizedPath}${search}`;
};

const forwardRequest = async (request: NextRequest, path: string[]) => {
    const targetUrl = buildTargetUrl(path, request.nextUrl.search);
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    const headers = new Headers();
    if (cookieHeader) {
        headers.set("Cookie", cookieHeader);
    }
    headers.set("Accept", "application/json");

    let body: BodyInit | undefined;
    if (!["GET", "HEAD"].includes(request.method)) {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("multipart/form-data")) {
            body = await request.formData();
        } else if (contentType.includes("application/json")) {
            body = await request.text();
            headers.set("Content-Type", "application/json");
        } else {
            body = await request.text();
            if (contentType) {
                headers.set("Content-Type", contentType);
            }
        }
    }

    const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
    });

    const responseBody = await response.text();
    const nextResponse = new NextResponse(responseBody, {
        status: response.status,
    });

    const responseContentType = response.headers.get("content-type");
    if (responseContentType) {
        nextResponse.headers.set("Content-Type", responseContentType);
    }

    return nextResponse;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params;
    return forwardRequest(request, path);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params;
    return forwardRequest(request, path);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params;
    return forwardRequest(request, path);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params;
    return forwardRequest(request, path);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path } = await params;
    return forwardRequest(request, path);
}
