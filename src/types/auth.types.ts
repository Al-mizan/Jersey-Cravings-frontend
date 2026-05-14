export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface IUserInfo {
    id: string;
    createdAt: string;
    updatedAt: string;
    identifier?: string;
    identifierVerified?: boolean;
    name: string;
    image?: string | null;
    isDeleted: boolean;
    role: UserRole;
    status: UserStatus;
    deletedAt?: string | null;
}

export interface ILoginPayload {
    identifier: string;
    password: string;
}

export interface IRegisterPayload {
    name: string;
    identifier: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IVerifyIdentifierPayload {
    identifier: string;
    otp: string;
}

export interface IForgetPasswordPayload {
    identifier: string;
}

export interface IResetPasswordPayload {
    identifier: string;
    otp: string;
    newPassword: string;
}

export interface ILoginIdentifierPayload {
    identifier: string;
    password: string;
}

export interface IRegisterIdentifierPayload {
    identifier: string;
    name: string;
    password: string;
}

export interface ISendOtpPayload {
    identifier: string;
}

export interface IVerifyOtpPayload {
    identifier: string;
    otp: string;
}

export interface IVerifyOtpResponse {
    verified: boolean;
}

export interface ISendOtpResponse {
    channel: "email" | "sms";
    expiresAt: string;
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
