import { UserRole } from "@/types/auth.types";

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}
