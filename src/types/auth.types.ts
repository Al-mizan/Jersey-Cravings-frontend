/**
 * Auth types aligned with backend contract
 * All types mirror the backend API response shape and request payloads
 */

export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type AuthProvider = "EMAIL" | "GOOGLE";

/**
 * User account data returned from backend
 */
export interface IUser {
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
    needPasswordChange: boolean;
    deletedAt?: string | null;
}

/**
 * Login/Register response from backend
 */
export interface ILoginResponse {
    token: string; // better-auth.session_token
    accessToken: string;
    refreshToken: string;
    user: IUser;
}

/**
 * Register request payload
 */
export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
}

/**
 * Login request payload
 */
export interface ILoginPayload {
    email: string;
    password: string;
}

/**
 * Change password request payload
 */
export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

/**
 * Verify email request payload
 */
export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}

/**
 * Forget password request payload (triggers OTP send)
 */
export interface IForgetPasswordPayload {
    email: string;
}

/**
 * Reset password request payload
 */
export interface IResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

/**
 * Refresh token response
 */
export interface IRefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    token: string; // better-auth.session_token
}

/**
 * Session data from better-auth
 */
export interface ISession {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}

/**
 * Full session data including user info
 */
export interface ISessionData {
    session: ISession;
    user: IUser;
}

/**
 * API response wrapper (from frontend ApiResponse)
 */
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
}

/**
 * Generic error response
 */
export interface IApiErrorResponse {
    success: false;
    message: string;
}

/**
 * Current user info returned from /auth/me
 */
export interface IUserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    isDeleted: boolean;
    emailVerified: boolean;
    needPasswordChange: boolean;
    image?: string | null;
}

/**
 * Logout response
 */
export interface ILogoutResponse {
    loggedOut: boolean;
}

/**
 * Auth context/hook return type
 */
export interface IAuthState {
    user: IUserInfo | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
