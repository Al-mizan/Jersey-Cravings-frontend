import LoginForm from "@/components/modules/Auth/LoginForm";

interface LoginParams {
    searchParams: Promise<{
        redirect?: string;
        message?: string;
        error?: string;
    }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
    const params = await searchParams;
    const redirectPath = params.redirect;
    const message = params.message;
    const oauthError = params.error;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <LoginForm
                redirectPath={redirectPath}
                message={message}
                oauthError={oauthError}
            />
        </div>
    );
};

export default LoginPage;
