import RegisterForm from "@/components/modules/Auth/RegisterForm";

interface RegisterParams {
    searchParams: Promise<{
        redirect?: string;
        message?: string;
        error?: string;
    }>;
}

const RegisterPage = async ({ searchParams }: RegisterParams) => {
    const params = await searchParams;
    const redirectPath = params.redirect;
    const message = params.message;
    const oauthError = params.error;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <RegisterForm
                redirectPath={redirectPath}
                message={message}
                oauthError={oauthError}
            />
        </div>
    );
};

export default RegisterPage;
