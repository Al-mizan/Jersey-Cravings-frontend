import { UserRole } from "@/types/auth.types";

export interface UserInfo {
    id: string;
    name: string;
    identifier: string;
    role: UserRole;
    image?: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
}