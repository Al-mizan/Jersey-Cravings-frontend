export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface IUserInfo {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    isDeleted: boolean;
    role: UserRole;
    status: UserStatus;
    deletedAt?: string | null;
}

export interface ILoginPayload {
    email: string;
    password: string;
}

export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}

export interface IForgetPasswordPayload {
    email: string;
}

export interface IResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: IUserInfo;
}

export interface IRegisterResponse {
    accessToken: string;
    refreshToken: string;
    user: IUserInfo;
}

export interface IRefreshTokenResponse {
    refreshed: boolean;
}

export interface ILogoutResponse {
    loggedOut: boolean;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    errorSources?: Array<{
        path: string;
        message: string;
    }>;
}

export interface IApiErrorResponse {
    success: false;
    message: string;
    errorSources?: Array<{
        path: string;
        message: string;
    }>;
}

export interface IAuthState {
    user: IUserInfo | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}
