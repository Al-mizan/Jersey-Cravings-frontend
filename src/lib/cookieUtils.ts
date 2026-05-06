"use server";

import { cookies } from "next/headers";

export const setCookie = async (
    name: string,
    value: string,
    maxAgeInSeconds: number,
) => {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const cookieSameSite = isProduction ? "none" : "lax";


    cookieStore.set(name, value, {
        httpOnly: true,
        secure: isProduction,
        sameSite: cookieSameSite,
        path: "/",
        maxAge: maxAgeInSeconds,
    })
}

export const getCookie = async (name: string) => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}

export const deleteCookie = async (name: string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
}