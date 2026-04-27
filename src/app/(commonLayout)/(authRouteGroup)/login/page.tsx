import LoginForm from "@/components/modules/Auth/LoginForm";

interface LoginParams {
    searchParams: Promise<{ redirect?: string; message?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
    const params = await searchParams;
    const redirectPath = params.redirect;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <LoginForm redirectPath={redirectPath} />
        </div>
    );
};

export default LoginPage;
